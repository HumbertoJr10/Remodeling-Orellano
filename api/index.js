//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const server = require('./src/app.js');
const { conn, Diet, Message } = require('./src/db.js');
const PORT = process.env.PORT || 3001;

const typesOfDiets = ["dairy free",
                      "fodmap friendly",
                      "gluten free",
                      "ketogenic",
                      "lacto ovo vegetarian",
                      "paleolithic",
                      "pescetarian",
                      "primal",
                      "vegan",
                      "whole 30"]

// Syncing all the models at once; alter only Message to add new columns safely.
conn
  .sync({ force: false })
  .then(() => Message.sync({ alter: true }))
  .then(() => {
    server.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`); // eslint-disable-line no-console
      typesOfDiets.map((type) => Diet.findOrCreate({ where: { name: type } }));
    });
  });
