var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();
const moment = require('moment')
module.exports = function (db) {
  const field = db.collection('manipulate');


  router.get('/', async function (req, res, next) {
    try {
      const sortBy = req.query.sortBy || '_id'
      const sortMode = req.query.sortMode || 'asc'
      const url = req.url == '/' ? '/?page=1&sortBy=_id&sortMode=asc' : req.url 
      
      
      let value = {};

      if (req.query.idch == 'on' && req.query._id != '') {
          value._id = ObjectId(req.query._id)
      }

      if (req.query.stringch == 'on' && req.query.string != '') {
          value.string = {$regex: req.query.string}
      }

      if (req.query.integerch == 'on' && req.query.integer != '') {
          value.integer = req.query.integer
      }

      if (req.query.floatch == 'on' && req.query.float != '') {
          value.float = req.query.float
          
      }

      if (req.query.datech == 'on' && req.query.startdate != '' && req.query.enddate != '') {
          value.date = { $gte: req.query.startdate, $lt: req.query.enddate}
      }

      if (req.query.booleanch == 'on' && req.query.boolean != '') {
          value.boolean = req.query.boolean
      }
    
      console.log(value)
      
      const page = parseInt(req.query.page) || 1
      const limit = 3
      const offset = (page - 1) * limit

      const total = await field.count(value)
      const totalPage = Math.ceil(total / limit)

      const read = await field.find(value).limit(limit).skip(offset).sort({[sortBy]: sortMode}).toArray()
      res.render('index', {read, moment, page, totalPage, offset, query: req.query, url})
    } catch (err) {
      res.json({ err })
    }
  });


  router.get('/add', function (req, res, next) {
      res.render('formadd')
  })

  router.post("/add", async function (req, res, next) {
   try {
     await field.insertOne({
       string: req.body.string, 
       integer: req.body.integer,
       float: req.body.float,
       date: req.body.date,
       boolean: req.body.boolean})
     res.redirect('/')
   } catch (err) {
    res.json({err})
   }
  });

  router.get('/delete/:id', async function (req, res, next) {
    try {
      await field.deleteOne({_id: ObjectId(req.params.id)})
      res.redirect('/')
    } catch (err) {
      res.json({err})
    }
  })


  router.get('/edit/:id', async function (req, res, next) {
    try {
      const showEdit = await field.findOne({_id: ObjectId(req.params.id)})
      res.render('formedit', {data: showEdit, moment})
    } catch (err) {
      res.json({err})
    }
  })


  router.post('/edit/:id', async function (req, res, next) {
    try {
      await field.updateOne({
        _id: ObjectId(req.params.id)
      }, {
        $set: {
          string: req.body.string,
          integer: req.body.integer,
          float: req.body.float,
          date: req.body.date,
          boolean: req.body.boolean
        }
      })
      res.redirect('/')
    } catch (err) {
      res.json({err})
    }
  })
  return router;
}
