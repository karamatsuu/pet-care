// npm install joi

const Joi = require('joi');

const schemas = {
  createPet: Joi.object({
    name: Joi.string().max(100).required(),
    type: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'other').required(),
    breed: Joi.string().max(100),
    birthDate: Joi.date().required(),
    weight: Joi.number().positive(),
  }),

  createHealthLog: Joi.object({
    petId: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required(),
    logType: Joi.string()
      .valid('vaccine', 'medication', 'vet_visit', 'symptom', 'weight', 'meal')
      .required(),
    description: Joi.string().max(500).required(),
    date: Joi.date().required(),
  }),
};

const validate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];

  if (!schema) {
    return res.status(500).json({
      error: `Validation schema '${schemaName}' is not defined.`,
    });
  }

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      error: 'Validation failed.',
      details: error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  req.validatedData = value;
  return next();
};

validate.schemas = schemas;

module.exports = validate;
