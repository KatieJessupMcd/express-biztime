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
  try {
    const result = await db.query(
      `SELECT code, name, description, invoices.id, invoices.amt, invoices.paid, invoices.add_date, invoices.paid_date FROM companies
      JOIN invoices on companies.code = invoices.comp_code
      WHERE code = $1`,
      [req.params.code]
    );
    let { id, amt, paid, add_date, paid_date } = result.rows[0];
    let { code, name, description } = result.rows[0];
    console.log(result);
    console.log(`This is result rows : ${result.rows}`);
    return res.json({
      company: {
        code,
        name,
        description,
        invoice: [id, amt, paid, add_date, paid_date]
      }
    });
  } catch (err) {
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

    if (result.rows.length === 0) {
      throw new APIError('Company cannot be found', 404);
    }

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

    if (result.rows.length === 0) {
      throw new APIError('Company cannot be found', 404);
    }

    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
