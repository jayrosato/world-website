const pool = require('./pool');

const formatDateISO = (date) => {
    const isoString = date.toISOString();
    const formattedDate = isoString.split("T")[0];
    return formattedDate;
};

const now = new Date(Date.now()).toISOString();

//store columns as {column:[]}
class Model {
    constructor(tableName){
        this.tableName = tableName
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this.tableName)) {
            throw new Error('Invalid table name');
        }
        this.columns = []
    }

    addField(name, type, maxlength=null, nullable=false, unique=false, defaultValue=null, onUpdate=false){
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
        vals = vals.map(v => "'"+v+"'")
        vals = vals.join(", ")
        try{
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
}





/*
class Model{
    constructor(tableName, addedUpdate=null){
        this.tableName = tableName
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this.tableName)) {
            throw new Error('Invalid table name');
        }
        this.columns = []
        this.addedUpdate = addedUpdate
    }
    //add non nullable and unique statements
    //foreign keys
    varchar(name, length){
        const qCreate = `${name} VARCHAR(${length})`
        const qAdd = `ALTER TABLE ${this.tableName} ADD COLUMN ${name} VARCHAR ${length}`
        this.columns.push({columnName:name, create:qCreate, add: qAdd, type: 'varchar', maxlength:length})
    }
    integer(name){
        const qCreate = `${name} INTEGER`
        const qAdd = `ALTER TABLE ${this.tableName} ADD COLUMN ${name} INTEGER`
        this.columns.push({columnName:name, create:qCreate, add: qAdd, type:'integer'})
    }
    text(name){
        const qCreate = `${name} TEXT`
        const qAdd = `ALTER TABLE ${this.tableName} ADD COLUMN ${name} TEXT`
        this.columns.push({columnName:name, create:qCreate, add: qAdd, type:'text'})
    }
    date(name){
        const qCreate = `${name} DATE`
        const qAdd = `ALTER TABLE ${this.tableName} ADD COLUMN ${name} DATE`
        this.columns.push({columnName:name, create:qCreate, add: qAdd, type:'date'})
    }
    dateTime(name){
        const qCreate = `${name} TIMESTAMP`
        const qAdd = `ALTER TABLE ${this.tableName} ADD COLUMN ${name} TIMESTAMP`
        this.columns.push({columnName:name, create:qCreate, add: qAdd, type:'datetime'})
    }

    async checkInDB(){
        if (this.addedUpdate == true) {
            if (!this.columns.find(c => c.columnName === 'created_at')) {
                this.dateTime('created_at');
            }
            if (!this.columns.find(c => c.columnName === 'updated_at')) {
                this.dateTime('updated_at');
            }
        }
        const { rows } = await pool.query('SELECT count(*) FROM information_schema.tables WHERE table_name = $1', [this.tableName])
        if(parseInt(rows[0].count) === 0){
            const columnNames = this.columns.map(c=> c.create)
            const statement ='id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,'+columnNames.join(', ')
            try {
                await pool.query(`CREATE TABLE ${this.tableName} (${statement})`)
            }
            catch (err) {
                console.error(err)
                return 'Operation failed'
            }
        }
        
        
        catch(err){
            console.error(err)
            return `Error in validating ${this.tableName}`
        }
    }

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

    async createRecord(values){
        const createdCol = this.columns.find(c => c.columnName === 'created_at')
        if(createdCol){
            values.push(Date.now())
        }
        const updatedCol = this.columns.find(c => c.columnName === 'updated_at')
        if(updatedCol){
            values.push(Date.now())
        }

        if (values.length !== this.columns.length) {
            console.error(`Expected ${this.columns.length} values but got ${values.length}`);
            return 'Incorrect number of values';
        }

        const columns = this.columns.map(c=> c.columnName)
        const validated = this.validate(columns, values)
        if(validated != true){
            return validated
        }

        const statement = columns.join(', ') 
        try{
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
            await pool.query(`INSERT INTO ${this.tableName} (${statement}) VALUES (${placeholders})`, values)
        }
        catch (err) {
            console.error(err)
            return 'Operation failed'
        }
    }

    
    //pass {column:value, column:value}
    //assuming that all datetimes are prodecurally generated and therefore do not need to be validated
    async validate(columns, values){
        if(columns.length != values.length){
            return `Error updating ${this.tableName} -- number of values and columns provided did not match. Make sure you enter each pair as a {column:value} pair`
        }
        for(let i=0; i<values.length; i++){
            const value = values[i]
            const column = this.columns.find(c => c.columnName === columns[i])
            const type = column.type
            if(type == 'varchar'){
                if(value.length > column.maxlength){
                    return `${column.name} in ${this.tableName} cannot greater than ${column.maxlength} characters.`
                }
            }
            if(type == 'integer'){
                let int = parseInt(value)
                if(isNaN(int)){
                    return `${column.name} in ${this.tableName} must be an integer.`
                }
            }
            if(type == 'date'){
                const parsed = new Date(value)
                if (isNaN(parsed)) {
                return `${column.name} in ${this.tableName} must be a valid date.`
            }
            values[i] = formatDateISO(parsed)
            }
        }
        return true
    }

    async updateRecord(id, columns, values){
        if (columns.length != values.length){
            console.log(`Error: Columns and values for update statement in table ${this.tableName} do not match, double check inputs`)
            return
        }

        const validated = this.validate(columns, values)
        if(validated != true){
            return validated
        }
        updatedCol = this.columns.find(c => c.name === 'updated_at')
        if(updatedCol){
            columns.push('updated_at')
            values.push(Date.now().toISOString())
        }
        const assignments  = columns.map((col, i) => `${col} = $${i+1}`).join(', ')
        const query = `UPDATE ${this.tableName} SET ${assignments} WHERE id = $${columns.length + 1}`

        try{await pool.query(query, [...values, id])}
        catch (err) {
            console.error(err)
            return 'Operation failed'
        }
    }
    async deleteRecord(id){
        try{await pool.query(`DELETE FROM ${this.tableName} WHERE id=$1`, [id])}
        catch (err) {
            console.error(err)
            return 'Operation failed'
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
const forums = new Model('forums')

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



