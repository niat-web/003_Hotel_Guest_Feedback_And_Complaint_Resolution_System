import { Sequelize, DataTypes } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQLite database connection
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../hotel_feedback.sqlite"),
  logging: false,
});

// Guest Feedback Model
export const Feedback = sequelize.define(
  "Feedback",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    room_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    check_out_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    room_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    cleanliness_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    food_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    staff_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    value_rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "guest_feedback",
    timestamps: true,
  }
);

// Complaint Model
export const Complaint = sequelize.define(
  "Complaint",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    feedback_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Feedback,
        key: "id",
      },
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
      // room / cleanliness / food / staff / value
    },

    severity: {
      type: DataTypes.STRING,
      allowNull: false,
      // Minor / Major / Critical
    },

    department: {
      type: DataTypes.STRING,
      allowNull: false,
      // Room Service / Housekeeping / Restaurant / Front Office / Management
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Open",
      // Open / In Progress / Resolved / Escalated
    },

    assigned_to: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Department Supervisor",
    },

    sla_deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    resolution_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "complaints",
    timestamps: true,
  }
);

// Associations
Feedback.hasMany(Complaint, {
  foreignKey: "feedback_id",
  onDelete: "CASCADE",
});

Complaint.belongsTo(Feedback, {
  foreignKey: "feedback_id",
});

export default sequelize;