const faunadb = require('faunadb');
const shortid = require('shortid');
const querystring = require('querystring');
const axios = require('axios');

require('dotenv').config();

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
})


/* export our lambda function as named "handler" export */
exports.handler = (event, context, callback) => {

  // get the form data
  const data = querystring.parse(event.body);

  // add a unique path id
  const uniquePath = shortid.generate();
  data.lollyPath = uniquePath;
  const lolly = {
    data: data
  };


  // Create the lolly entry in the fauna db
  client.query(q.Create(q.Ref('classes/lollies'), lolly))
    .then((response) => {
      console.log('success', response);

      // Trigger a new build to freeze this lolly forever
      axios.post('https://api.netlify.com/build_hooks/5d946fe5b12c4cdd4bdb12b9')
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });

      // Success! Go to a page to view the result
      return callback(null, {
        body: JSON.stringify(response),
        statusCode: 302,
        headers: {
          Location: `/lolly/${uniquePath}`,
        }
      });
    }).catch((error) => {
      console.log('error', error);
      // Error! return the error with statusCode 400
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify(error)
      });
    });

}
