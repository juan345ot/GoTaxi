const Address = require('../../models/Address');
const { validateCreateAddress, validateUpdateAddress } = require('../dtos/addressDTO');
const { logToFile } = require('../../utils/logger');
const { createSuccessResponse, createNotFoundResponse } = require('../../utils/responseHelpers');
const mongoose = require('mongoose');

/**
 * Obtener todas las direcciones del usuario actual
 */
exports.getUserAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ usuario: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return createSuccessResponse(
      res,
      addresses,
      'Direcciones obtenidas exitosamente',
    );
  } catch (err) {
    logToFile(`Error getUserAddresses: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'ADDRESSES_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

/**
 * Obtener una dirección específica por ID
 */
exports.getAddressById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Dirección', req.params.id);
    }

    const address = await Address.findOne({
      _id: req.params.id,
      usuario: req.user.id,
    }).lean();

    if (!address) {
      return createNotFoundResponse(res, 'Dirección', req.params.id);
    }

    return createSuccessResponse(res, address, 'Dirección obtenida exitosamente');
  } catch (err) {
    logToFile(`Error getAddressById: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'ADDRESS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

/**
 * Crear una nueva dirección para el usuario actual
 */
exports.createAddress = async (req, res, next) => {
  try {
    const { error } = validateCreateAddress(req.body);
    if (error) {
      const errObj = new Error(error.details[0].message);
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = error.details;
      return next(errObj);
    }

    // Construir dirección completa si no se proporciona
    let direccionCompleta = req.body.direccionCompleta;
    if (!direccionCompleta) {
      const parts = [
        req.body.calle,
        req.body.altura,
        req.body.ciudad,
      ].filter(Boolean);
      direccionCompleta = parts.join(', ');
    }

    const addressData = {
      ...req.body,
      usuario: req.user.id,
      direccionCompleta,
    };

    const address = await Address.create(addressData);

    logToFile(`Dirección creada: ${address.nombre} para usuario ${req.user.id}`);
    return createSuccessResponse(
      res,
      address,
      'Dirección creada exitosamente',
      201,
    );
  } catch (err) {
    logToFile(`Error createAddress: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'ADDRESS_CREATE_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

/**
 * Actualizar una dirección existente
 */
exports.updateAddress = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Dirección', req.params.id);
    }

    const { error } = validateUpdateAddress(req.body);
    if (error) {
      const errObj = new Error(error.details[0].message);
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = error.details;
      return next(errObj);
    }

    // Si se actualizan calle, altura o ciudad, reconstruir direccionCompleta
    if (req.body.calle || req.body.altura || req.body.ciudad) {
      const existingAddress = await Address.findOne({
        _id: req.params.id,
        usuario: req.user.id,
      });

      if (!existingAddress) {
        return createNotFoundResponse(res, 'Dirección', req.params.id);
      }

      const calle = req.body.calle || existingAddress.calle;
      const altura = req.body.altura || existingAddress.altura;
      const ciudad = req.body.ciudad || existingAddress.ciudad;

      const parts = [calle, altura, ciudad].filter(Boolean);
      req.body.direccionCompleta = parts.join(', ');
    }

    const address = await Address.findOneAndUpdate(
      {
        _id: req.params.id,
        usuario: req.user.id,
      },
      req.body,
      { new: true, runValidators: true },
    ).lean();

    if (!address) {
      return createNotFoundResponse(res, 'Dirección', req.params.id);
    }

    logToFile(`Dirección actualizada: ${address.nombre} para usuario ${req.user.id}`);
    return createSuccessResponse(res, address, 'Dirección actualizada exitosamente');
  } catch (err) {
    logToFile(`Error updateAddress: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'ADDRESS_UPDATE_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

/**
 * Eliminar una dirección
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Dirección', req.params.id);
    }

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      usuario: req.user.id,
    });

    if (!address) {
      return createNotFoundResponse(res, 'Dirección', req.params.id);
    }

    logToFile(`Dirección eliminada: ${address.nombre} para usuario ${req.user.id}`);
    return createSuccessResponse(res, null, 'Dirección eliminada exitosamente');
  } catch (err) {
    logToFile(`Error deleteAddress: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'ADDRESS_DELETE_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
