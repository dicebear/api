import avatarAction from './actions/avatar';
import statsAction from './actions/stats';
import express from 'express';

const app = express();
const port = 3000;

app.get('/:version/api/:style/:seed.svg', avatarAction);
app.get('/:version/v2/:style/:seed.svg', avatarAction);
app.get('/:version/api/:style/.svg', avatarAction);
app.get('/:version/v2/:style/.svg', avatarAction);
app.get('/:version/stats.json', statsAction);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
