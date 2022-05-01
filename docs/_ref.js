import * as difflet from 'difflet';
import colors from 'colors';
import { StandardMessage, changeDataCapture } from './changeDataCapture';

const diffMessage = (message: StandardMessage) => {
  const schemaTableCombination = `${message.schema}.${message.table}`;
  message.affectedRows.forEach((row) => {
    if (message.type === 'DELETE') {
      console.log(colors.red(`DELETED ${schemaTableCombination}`));
      console.log(row.before);
    }
    if (message.type === 'INSERT') {
      if (message.schema.includes('faudit')) {
        console.log(
          colors.gray(`AUDIT ROW CREATED FOR ${schemaTableCombination}`)
        );
        return;
      }
      console.log(colors.green(`CREATED ${schemaTableCombination}`));
      console.log(row.after);
    }
    if (message.type === 'UPDATE') {
      console.log(colors.blue(`UPDATED ${schemaTableCombination}`));
      console.log(difflet.compare(row.before, row.after));
    }
  });
};
