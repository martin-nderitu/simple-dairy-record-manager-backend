import Seq, {
    HasManyAddAssociationMixin,
    HasManyAddAssociationsMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin,
    HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin,
    HasManyRemoveAssociationsMixin,
    HasManySetAssociationsMixin,
    Model,
    Optional,
    Sequelize,
} from "sequelize";
import * as argon2 from "argon2";
import {MilkRecordAttributes, MilkRecordInstance} from "./milkRecord.js";
import {RateAttributes, RateInstance} from "./rate.js";

const {DataTypes} = Seq;

export interface UserAttributes {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role?: "admin" | "farmer" | "milk collector";
    password: string;
    active?: boolean;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;

    // to access associations when eager loading
    rates?: RateAttributes[] | RateAttributes["id"][];
    milkRecords?: MilkRecordAttributes[] | MilkRecordAttributes["id"][];
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
    dataValues?: any;

    // model associations
    getMilkRecords: HasManyGetAssociationsMixin<MilkRecordInstance>;
    countMilkRecords: HasManyCountAssociationsMixin;
    hasMilkRecord: HasManyHasAssociationMixin<MilkRecordInstance, MilkRecordInstance["id"]>;
    hasMilkRecords: HasManyHasAssociationsMixin<MilkRecordInstance, MilkRecordInstance["id"]>;
    setMilkRecords: HasManySetAssociationsMixin<MilkRecordInstance, MilkRecordInstance["id"]>;
    addMilkRecord: HasManyAddAssociationMixin<MilkRecordInstance, MilkRecordInstance["id"]>;
    addMilkRecords: HasManyAddAssociationsMixin<MilkRecordInstance, MilkRecordInstance["id"]>;
    removeMilkRecord: HasManyRemoveAssociationMixin<MilkRecordInstance, MilkRecordInstance["id"]>;
    removeMilkRecords: HasManyRemoveAssociationsMixin<MilkRecordInstance, MilkRecordInstance["id"]>;
    createMilkRecord: HasManyCreateAssociationMixin<MilkRecordAttributes>;

    getRates: HasManyGetAssociationsMixin<RateInstance>;
    countRates: HasManyCountAssociationsMixin;
    hasRate: HasManyHasAssociationMixin<RateInstance, RateInstance["id"]>;
    hasRates: HasManyHasAssociationsMixin<RateInstance, RateInstance["id"]>;
    setRates: HasManySetAssociationsMixin<RateInstance, RateInstance["id"]>;
    addRate: HasManyAddAssociationMixin<RateInstance, RateInstance["id"]>;
    addRates: HasManyAddAssociationsMixin<RateInstance, RateInstance["id"]>;
    removeRate: HasManyRemoveAssociationMixin<RateInstance, RateInstance["id"]>;
    removeRates: HasManyRemoveAssociationsMixin<RateInstance, RateInstance["id"]>;
    createRate: HasManyCreateAssociationMixin<RateAttributes>;
}

export const UserFactory = (sequelize: Sequelize) => {
    const User = sequelize.define<UserInstance>("User", {
        id: {
            type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true,
            unique: true, allowNull: false
        },
        email: {type: DataTypes.STRING, unique: true, allowNull: false},
        firstName: {type: DataTypes.STRING, allowNull: false},
        lastName: {type: DataTypes.STRING, allowNull: false},
        role: {
            type: DataTypes.ENUM("admin", "farmer", "milk collector"),
            allowNull: false, defaultValue: "farmer"
        },
        password: {type: DataTypes.STRING, allowNull: false},
        active: {
            type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true
        },
    }, {
        tableName: "users",
        underscored: true,
    });

    User.beforeCreate(async (user, options) => {
        user.password = await argon2.hash(user.password);
    });

    User.beforeBulkCreate(async (users, options) => {
        for (const user of users) { user.password = await argon2.hash(user.password) }
    });

    User.beforeUpdate(async (user, options) => {
        if (user.password) {
            user.password = await argon2.hash(user.password);
        }
    });

    // @ts-ignore

    User.associate = (models: any) => {
        User.hasMany(models.MilkRecord, {
            foreignKey: {
                name: "farmerId",
                allowNull: false
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
        });

        User.hasMany(models.MilkRecord, {
            foreignKey: {
                name: "milkCollectorId",
                allowNull: true
            },
            onDelete: "SET NULL",
            onUpdate: "SET NULL"
        });

        User.hasMany(models.Rate, {
            foreignKey: {
                name: "setterId",
                allowNull: true
            },
            onDelete: "SET NULL",
            onUpdate: "SET NULL"
        });
    }
    return User;
}
