const db = require('../db');
const express = require('express');
const router = express.Router();

router.get('/', async function(req, res, next) {
  try {
    const results = await db.query(
      `SELECT code, name, description FROM companies`
    );
    // console.log(results);
    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
});

router.get('/:code', async function(req, res, next) {
  let code = req.params.code;
  // console.log('this is our request param: ' + code);

  try {
    const results = await db.query(
      `SELECT code, name, description FROM companies WHERE code = $1`,
      [code]
    );
    // TODO should throw a 404 response
    // console.log('where is our error?!');
    return res.json({ company: results.rows });
  } catch (err) {
    // console.log('we made it inside error! yay!');
    return next(err);
  }
});

router.post('/', async function(req, res, next) {
  try {
    const { code, name, description } = req.body.company;
    console.log(req.body);
    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
      [code, name, description]
    );
    console.log('here is the result: ', JSON.stringify(result.rows[0]));
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:code', async function(req, res, next) {
  try {
    const { code, name, description } = req.body.company;

    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2
           WHERE code = $3
           RETURNING code, name, description`,
      [name, description, req.params.code]
    );

    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:code', async function(req, res, next) {
  try {
    const result = await db.query('DELETE FROM companies WHERE code = $1', [
      req.params.code
    ]);

    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
