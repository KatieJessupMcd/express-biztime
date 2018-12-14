const db = require('../db');
const express = require('express');
const router = express.Router();
const APIError = require('./errors');

/** Get invoice: {invoices: [{id, comp_code}]} */

router.get('/', async function(req, res, next) {
  try {
    const results = await db.query(`SELECT id, comp_code FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (err) {
    return next(err);
  }
});

// Get specific invoice
// {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
router.get('/:id', async function(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, companies.code, companies.name, companies.description FROM invoices
          JOIN companies ON invoices.comp_code = companies.code
          WHERE invoices.id = $1
          `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw new APIError('Invoice cannot be found.', 404);
    }

    let { id, amt, paid, add_date, paid_date } = result.rows[0];
    let { code, name, description } = result.rows[0];

    return res.json({
      invoice: {
        id,
        amt,
        paid,
        add_date,
        paid_date,
        company: { code, name, description }
      }
    });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async function(req, res, next) {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
           VALUES ($1, $2)
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    // let results = result.rows[0];
    return res.json({
      invoice: result.rows[0]
    });
  } catch (err) {
    return next(err);
  }
});

router.put('/:id', async function(req, res, next) {
  try {
    const { amt } = req.body;
    const result = await db.query(
      `UPDATE invoices SET amt=$1 WHERE id = $2
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [req.body.amt, req.params.id]
    );

    if (result.rows.length === 0) {
      throw new APIError('Invoice cannot be found.', 404);
    }
    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async function(req, res, next) {
  try {
    const result = await db.query('DELETE FROM invoices WHERE id = $1', [
      req.params.id
    ]);
    return res.json({ status: 'deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
