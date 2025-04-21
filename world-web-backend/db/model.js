const pool = require('./pool');

const formatDateISO = (date) => {
    const isoString = date.toISOString();
    const formattedDate = isoString.split("T")[0];
    return formattedDate;
};

const now = new Date(Date.now()).toISOString();
const models = []
//store columns as {column:[]}
class Model {
    constructor(tableName){
        this.tableName = tableName
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this.tableName)) {
            throw new Error('Invalid table name');
        }
        this.columns = []
        models.push(this)
    }

    addField(name, type, maxlength=null, nullable=false, unique=false, defaultValue=null, onUpdate=false, linkToTable=null, linkToField=null, onDelete=null){
        const moduleColumns = this.columns.map(c=> c.name)
        if(moduleColumns.includes(name)){
            console.log(`${name} is not unique.`)
        }
        if(type=='varchar'){
            if(maxlength==null){return console.error(`Column ${name} of type VARCHAR must have a length.`)}
            const createSQL = `${name} VARCHAR(${maxlength})`
            const addSQL = `ALTER TABLE ${this.tableName} ADD COLUMN ${name} VARCHAR ${maxlength}`
            this.columns.push({
                name:name, 
                type:type, 
                maxlength:maxlength, 
                nullable:nullable, 
                unique:unique, 
                defaultValue:defaultValue,
                onUpdate: onUpdate,
                create:createSQL, 
                add: addSQL,
            })
        }
        else if(type == 'integer' || type == 'text' || type == 'date' || type == 'timestamp'){
            const capitalized = type.toUpperCase()
            const createSQL = `${name} ${capitalized}`
            const addSQL = `ALTER TABLE ${this.tableName} ADD COLUMN ${name} ${capitalized}`
            this.columns.push({
                name:name, 
                type:type, 
                maxlength:maxlength, 
                nullable:nullable, 
                unique:unique, 
                onUpdate: onUpdate,
                defaultValue:defaultValue,
                create:createSQL, 
                add: addSQL,
            })
        }
        else if(type == 'foreign key'){
            if(!linkToTable || !linkToField){
                console.error(`Must provide linking information for foreign key fields.`)
            }

            if(onDelete){
                const capitalizedDelete = onDelete.toUpperCase()
                const createSQL = `${name} INTEGER, CONSTRAINT fk_${linkToTable} FOREIGN KEY(${name}) REFERENCES ${linkToTable} (${linkToField}) ON DELETE ${capitalizedDelete}`
                const addSQL = `ALTER TABLE ${this.tableName} ADD COLUMN ${name} INTEGER, ADD CONSTRAINT fk_${linkToTable} FOREIGN KEY(${name}) REFERENCES ${linkToTable} (${linkToField}) ON DELETE ${capitalizedDelete}`
                this.columns.push({
                    name:name, 
                    type:type, 
                    maxlength:maxlength, 
                    nullable:nullable, 
                    unique:unique, 
                    onUpdate: false,
                    defaultValue:false,
                    create:createSQL, 
                    add: addSQL,
                })
            }

            else{
                const createSQL = `${name} INTEGER, CONSTRAINT fk_${linkToTable} FOREIGN KEY(${name}) REFERENCES ${linkToTable} (${linkToField}) ON DELETE ${onDelete}`
                const addSQL = `ALTER TABLE ${this.tableName} ADD COLUMN ${name} INTEGER, ADD CONSTRAINT fk_${linkToTable} FOREIGN KEY(${name}) REFERENCES ${linkToTable} (${linkToField})`
                this.columns.push({
                    name:name, 
                    type:type, 
                    maxlength: maxlength, 
                    nullable: nullable, 
                    unique: unique, 
                    onUpdate: false,
                    defaultValue: false,
                    create: createSQL, 
                    add: addSQL,
                })
            }
        }
        else{
            console.error(`Data type ${type} is not a valid type.`)
            return
        }
    }

    
    async checkInDB(){
        try{
            const { rows } = await pool.query('SELECT count(*) FROM information_schema.tables WHERE table_name = $1', [this.tableName])
            if(parseInt(rows[0].count) === 0){
                const columnNames = this.columns.map(c=> c.create)
                const statement ='id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,'+columnNames.join(', ')
                try {
                    console.log(statement)
                    await pool.query(`CREATE TABLE ${this.tableName} (${statement})`)
                }
                catch (err) {
                    console.error(`Failed to create table ${this.tableName}`)
                    return 
                }
            }
            else{
                this.checkDBColumns()
            }
        }
        catch(err){
            console.error(`Failed to get schema from database`)
            return
        }
    }

    async checkDBColumns(){
        const moduleColumns = this.columns.map(c=> c.name)
        try{
            const { fields } = await pool.query(`SELECT * FROM ${this.tableName} LIMIT 0`)
            const dbColumns = fields.map(f => f.name)
    
            const mismatchedCols = []
            for(let i=0; i<dbColumns.length; i++){
                if(!moduleColumns.includes(dbColumns[i]) && dbColumns[i] != 'id'){
                    mismatchedCols.push(dbColumns[i])
                }
            }
            if(mismatchedCols.length > 0){
                console.log(`${this.tableName} contains column(s) ${mismatchedCols} not accounted for in the model. Please add this column using the model or run ".clean" to remove mismatched columns.`)
                return 
            }

            for(let i=0; i<moduleColumns.length; i++){
                if (!dbColumns.includes(moduleColumns[i])) {
                    const col = this.columns.find(c => c.name === moduleColumns[i]);
                    
                    if (col) {
                        await pool.query(col.add);
                        console.log(`Added column ${col.name} to database.`)
                    }
                }
            }
        }
        catch(err){
            console.error(`Failed to compare columns of table ${this.tableName} with db.`)
            return
        }
        console.log(`Table ${this.tableName} is up to date!`)
    }

    async validateField(name, value, id){
        const field = this.columns.find(column => column.name == name);
        
        if(field.nullable == false && value==null){
            console.error(`${field.name} cannot be null.`)
        }
        
        if(field.type == 'varchar'){
            if(value.length > field.maxlength){
                console.error(`${field.name} has maximum length of ${field.maxlength}.`)
                return false
            }
        }
        if(field.type == 'integer'){
            let int = parseInt(value)
            if(isNaN(int)){
                console.error(`${field.name} in ${this.tableName} must be an integer.`)
                return false
            }
        }
        if(field.type == 'date'){
            const parsed = new Date(value)
            if (isNaN(parsed)) {
                console.error(`${field.name} in ${this.tableName} must be a valid date.`)
                return false 
            }
        }
        if(field.unique == true){
            try{
                if(id==null){
                    const { rows } = await pool.query(`SELECT ${field.name} FROM ${this.tableName} WHERE ${field.name} = $1`, [value])
                    if(rows.length >0){
                        console.error(`${field.name} in ${this.tableName} must be unique (error during record creation).`)
                        return false
                    }
                }
                else{
                    const { rows } = await pool.query(`SELECT ${field.name} FROM ${this.tableName} WHERE ${field.name} = $1 AND id != $2`, [value, id])
                    if(rows.length >0){
                        console.error(`${field.name} in ${this.tableName} must be unique (error during record update).`)
                        return false
                    }
                }
            }
            catch(err){
                console.error(`${field.name} in ${this.tableName} must be unique.`)
                return false
            }
        }
        return true   
    }

    //input values as key value pair {column:value, column:value}, omit column to leave null, if nullable
    async createRecord(columnValues){
        let cols = Object.keys(columnValues)
        let vals = Object.values(columnValues)
        for(let i=0; i < this.columns.length; i++){
            const name = this.columns[i].name
            let j = cols.indexOf(name)

            if(j == -1){
                if(this.columns[i].defaultValue != null){
                    cols.push(this.columns[i].name)
                    vals.push(this.columns[i].defaultValue)
                }
                else if(this.columns[i].nullable == false){
                    console.error(`Column ${name} cannot be null.`)
                    return
                }
                else{continue}
            }

            else{
                const validate = await this.validateField(cols[j], vals[j], null)
                if(validate != true){
                    console.error(`Validation of column ${cols[j]} failed during record creation.`)
                    return
                }
            }
        }

        cols = cols.join(', ')
        vals = vals.map(v => v == null ? 'NULL' : `'${v}'`);
        vals = vals.join(", ")
        try{
            console.log(`INSERT INTO ${this.tableName} (${cols}) VALUES (${vals})`)
            await pool.query(`INSERT INTO ${this.tableName} (${cols}) VALUES (${vals})`)
        }
        catch(err){
            console.error(`Error recording information to the database.`)
        }
    }
    //{column:value}
    async updateRecord(id, columnValues){
        const moduleColumns = this.columns.map(c => c.name)
        let cols = Object.keys(columnValues)
        let vals = Object.values(columnValues)
        for(let i=0; i < cols.length; i++){
            if(!moduleColumns.includes(cols[i])){
                console.error(`Column ${cols[i]} does not exist in table ${this.tableName}`)
                return
            }
            const validate = await this.validateField(cols[i], vals[i], id)
            if(validate != true){
                console.error(`Validation of column ${cols[i]} failed during record update`)
                return
            }
        }
        for(let i=0; i < this.columns.length; i++){
            if(this.columns[i].onUpdate==true){
                if(this.columns[i].defaultValue == null && this.columns[i].nullable == false){
                    console.error(`Must set a default value for column ${this.columns[i].name} to use onUpdate.`)
                    return
                }
                cols.push(this.columns[i].name)
                vals.push(this.columns[i].defaultValue)
            }
                
        }

        const assignments  = cols.map((col, i) => `${col} = $${i+1}`).join(', ')
        const query = `UPDATE ${this.tableName} SET ${assignments} WHERE id = $${cols.length + 1}`
        try{
            await pool.query(query, [...vals, id])
        }
        catch(err){
            console.error(`Error recording information to the database.`)
        }
    }

    async deleteRecord(id){
        try{await pool.query(`DELETE FROM ${this.tableName} WHERE id=$1`, [id])}
        catch (err) {
            console.error(err)
            return 'Operation failed'
        }
    }

    async getRecords(value, column){
        if(!value && !column){
            const { rows } = await pool.query(`SELECT * FROM ${this.tableName}`)
            return rows
        }
        try{
            const { rows } = await pool.query(`SELECT * FROM ${this.tableName} WHERE ${column} = $1`, [value])
            return rows[0]
        }
        catch(err){
            console.error(`Error fetching data from ${this.tableName}`)
        }
    }

    //filterColumns/filterValues/operators can be a string or a list
        //if filter columns is a list and the other two are strings, it will default to assuming you want to match all columns based on the same condition
        //if using a list for filterValues, the list length must match that of filterColumns
    async filterTable(filterColumns, filterValues, operators, cond='AND'){
        const statement = []
        if(typeof filterColumns === 'string' && typeof filterValues === 'string'){
            if(!operators){
                operators = '='
            }
            try{
                const { rows } = await pool.query(`SELECT * FROM ${this.tableName} WHERE ${filterColumns} ${operators} $1 `, [filterValues])
                return rows
            }
            catch(err){
                console.error(`Error fetching records from ${this.tableName}`)
                return
            }
        }

        if(typeof filterColumns === 'object' && typeof filterValues === 'string'){
            if(!operators){
                operators = '='
            }
            for(let i=0; i<filterColumns.length; i++){
                const condition = `${filterColumns[i]} ${operators} $1`
                statement.push(condition)
            }
            const sql = statement.join(` ${cond} `)
            try{
                const { rows } = await pool.query(`SELECT * FROM ${this.tableName} WHERE ${sql}`, [filterValues])
                return rows
            }
            catch(err){
                console.error(`Error fetching records from ${this.tableName}`)
                return
            }
        }

        else if(filterColumns.length != filterValues.length){
            console.error(`Mismatched filter columns and filter values`)
                return
        }

        else if(filterColumns.length > 1 && filterValues.length > 1){
            for(let i=0; i<filterColumns.length; i++){
                const condition = `${filterColumns[i]} ${operators[i]} $${i+1}`
                statement.push(condition)
            }
            const sql = statement.join(' AND ')
            try{
                const { rows } = await pool.query(`SELECT * FROM ${this.tableName} WHERE ${statement}`, [...filterValues])
                return rows
            }
            catch(err){
                console.error(`Error fetching records from ${this.tableName}`)
            }
        }
    }

    async mergeTables(table, getColumns, matchColumn, foreignMatchColumn){
        const statement=getColumns.join(' ,')
        try{
            const { rows } = await pool.query(`SELECT ${statement} FROM ${this.tableName} INNER JOIN ${table} ON ${this.tableName}.${matchColumn} = ${table}.${foreignMatchColumn}`)
            return rows
        }
        catch(err){
            console.error(`Error joining records from ${this.tableName} and ${table}`)
        }
    }
}

module.exports = Model



/*
    async clean(){
        try{
            const { fields } = await pool.query('SELECT * FROM users LIMIT 0')
            const dbColumns = fields.map(f => f.name)
            const modColumns = this.columns.map(c => c.columnName)

            for(let i=0; i<dbColumns.length; i++){
                if(!modColumns.includes(dbColumns[i])){
                    await pool.query(`ALTER TABLE ${this.tableName} DROP COLUMN ${dbColumns[i]}`)
                }
            }
            }
        catch(err){
            console.error(err)
            return `Error in validating ${this.tableName}`
        }
    }
    async findByID(id) {
        try {
            const { rows } = await pool.query(`SELECT * FROM ${this.tableName} WHERE id=$1`, [id]);
            return rows[0] || null;
        } catch (err) {
            console.log('Record not found. It\'s possible this ID does not exist.');
            return null;
        }
    }

    async getAllRecords() {
        try {
            const { rows } = await pool.query(`SELECT * FROM ${this.tableName}`);
            return rows;
        } catch (err) {
            console.error(err);
            return 'Operation failed';
        }
    }
    async getColumns(columns){
        const statement = columns.join(', ') 
        try{
            const { rows } = await pool.query(`SELECT ${statement} FROM ${this.tableName}`)
            return { rows }
        }
        catch (err){
            console.error(err)
            return null
        }
    }
    async getFiltered(selectColumns, filterColumn, literalCondition = null, likeCondition = null) {
        const statement = selectColumns.join(', ');
        try {
            if (literalCondition !== null) {
                const query = `SELECT ${statement} FROM ${this.tableName} WHERE ${filterColumn} = $1`;
                const { rows } = await pool.query(query, [literalCondition]);
                return rows;
            } else if (likeCondition !== null) {
                const query = `SELECT ${statement} FROM ${this.tableName} WHERE ${filterColumn} ILIKE $1`;
                const { rows } = await pool.query(query, [`%${likeCondition}%`]);
                return rows;
            } else {
                return [];
            }
        } catch (err) {
            console.error(err);
            return 'Operation failed';
        }
    }

}
*/

const users = new Model('users')
users.addField('username', 'varchar', 255, false, true, null, false)
users.addField('email', 'varchar', 255, false, true, null, false)
users.addField('password', 'varchar', 255, false, false, null, false)
users.addField('access_level', 'varchar', 255, false, false, 'user', false)
users.addField('created_at', 'timestamp', null, false, false, now)
users.addField('updated_at', 'timestamp', null, null, false, now, true)

const faiths = new Model('faiths')
faiths.addField('name', 'varchar', 255, false, true, null, false)
faiths.addField('image_source', 'varchar', 255, false, false, null, false)
faiths.addField('description', 'varchar', 255, false, false, null, false)
faiths.addField('faith_group', 'varchar', 255, false, false, null, false)
faiths.addField('created_at', 'timestamp', null, false, false, now)
faiths.addField('updated_at', 'timestamp', null, null, false, now, true)

const posts = new Model('posts')
posts.addField('author', 'foreign key', null, false, false, null, false, 'users', 'id', 'cascade')
posts.addField('title', 'varchar', 255, false, false, 'New Post')
posts.addField('text', 'text', null, true, false, null)
posts.addField('parent_post', 'foreign key', null, true, false, null, null, 'posts', 'id', 'cascade')
posts.addField('created_at', 'timestamp', null, false, false, now)
posts.addField('updated_at', 'timestamp', null, null, false, now, true)

module.exports = { users, faiths, posts }


function migrate(){
    for(let i=0; i< models.length;i++){
        models[i].checkInDB()
    }
}

//migrate()


/*
async function initModel(model){
    model.addField('title', 'varchar', 255, false, true)
    model.addField('created_at', 'timestamp', null, false, false, now)
    model.addField('updated_at', 'timestamp', null, null, false, now, true)
    model.addField('author', 'integer', null, false, false, null, false)
    await model.checkInDB()
    //await model.createRecord({'title':'test post'})
    await model.updateRecord(1, {'author':1})
    await model.checkDBColumns()
}

initModel(forums)
*/


