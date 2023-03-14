import normalizr from 'normalizr';
const normalize = normalizr.normalize;
const schema = normalizr.schema;

//Esquemas normalizacion
const author = new schema.Entity('authors', {}, { idAttribute: 'email' });
const message = new schema.Entity('messages', { author: author }, { idAttribute: 'id' });
const mensajeria = new schema.Entity('mensajeria', { messages: [message] }, { idAttribute: 'id' });

export default { normalize, mensajeria };