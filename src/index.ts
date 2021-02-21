import v44 from '@dicebear/avatars-api-4.4';
import v45 from '@dicebear/avatars-api-4.5';
import statsAction from './actions/stats';
import express from 'express';

const app = express();
const port = 3000;

app.use('/4.4', v44);
app.use('/4.5', v45);
app.get('/:version/stats.json', statsAction);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
