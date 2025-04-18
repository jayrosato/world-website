const pool = require('./pool');

class Model{
    constructor(tableName){
        this.tableName = tableName
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this.tableName)) {
            throw new Error('Invalid table name');
        }
        this.columns = []
    }
    varchar(name, length){
        const qCreate = `${name} VARCHAR(${length})`
        this.columns.push({columnName:name, create:qCreate})
    }
    integer(name){
        const qCreate = `${name} INTEGER`
        this.columns.push({columnName:name, create:qCreate})
    }
    async checkInDB(){
        const { rows } = await pool.query('SELECT count(*) FROM information_schema.tables WHERE table_name = $1', [this.tableName])
        if(parseInt(rows[0].count) === 0){
            const columnNames = this.columns.map(c=> c.create)
            const statement ='id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,'+columnNames.join(', ')
            try {await pool.query(`CREATE TABLE ${this.tableName} (${statement})`)}
            catch (err) {
                console.error(err)
                return 'Operation failed'
            }
        }
    }
    async createNew(values){
        if (values.length !== this.columns.length) {
            console.error(`Expected ${this.columns.length} values but got ${values.length}`);
            return 'Incorrect number of values';
        }
        const columnNames = this.columns.map(c=> c.columnName)
        const statement = columnNames.join(', ') 
        try{
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
            await pool.query(`INSERT INTO ${this.tableName} (${statement}) VALUES (${placeholders})`, values)
        }
        catch (err) {
            console.error(err)
            return 'Operation failed'
        }
    }
    async updateRecord(id, columns, values){
        if (columns.length != values.length){
            console.log(`Error: Columns and values for update statement in table ${this.tableName} do not match, double check inputs`)
            return
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
(async () => {
    const forums = new Model('forum')
    forums.varchar('title', 255)
    forums.integer('numbers')

    await forums.checkInDB()
    await forums.createNew(['my post', 3])
    await forums.updateRecord(1, ['title'], ['my cool post'])
    await forums.deleteRecord(1)
})();

