const Message = require('../../models/Message');
const { logToFile } = require('../../utils/logger');

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ trip: req.params.id })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });
    
    // Formatear mensajes para el frontend
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      text: msg.text,
      time: msg.createdAt,
      isOwn: msg.sender._id.toString() === req.user.id.toString()
    }));
    
    return res.json(formattedMessages);
  } catch (err) {
    logToFile(`Error getMessages: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'MESSAGES_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      const errObj = new Error('Mensaje requerido');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }

    const message = new Message({
      trip: req.params.id,
      sender: req.user.id,
      text: text.trim()
    });
    
    await message.save();
    await message.populate('sender', 'name email');
    
    const formattedMessage = {
      id: message._id,
      text: message.text,
      time: message.createdAt,
      isOwn: true
    };
    
    logToFile(`Mensaje enviado en viaje ${req.params.id} por ${req.user.email}`);
    return res.status(201).json(formattedMessage);
  } catch (err) {
    logToFile(`Error sendMessage: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'MESSAGE_SEND_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
