const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define(
    'Invoice',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      invoiceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      pdfPath: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      updatedAt: false,
    }
  );
};
