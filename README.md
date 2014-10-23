# Pagelang

A Brainfuck-like Query Language for MySQL.


## How to use

Pagerlang provides a CLI tool.

To `SELECT * from table LIMIT 10, 5;`

```
$ pagelang -t table -e "}}}}}}}}}})))))v"
``` 

To `UPDATE table t1 JOIN (SELECT * from table LIMIT 3, 4) t2 ON t1.id = t2.id set t1.value = 100;`

```
$ pagelang -t table -e "}}}))))@value:100@"
``` 


## Option

You can pass options in initializing Pagelang like:

```javascript
var pager = new Pager({
  db: {
    host: 'localhost',
    user: 'foo',
    password: 'bar',
    database: 'my_db'  
  }
});
```

By default, Pagelang uses options below:

```json
{
  db: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pagelang'
  }
};
```
