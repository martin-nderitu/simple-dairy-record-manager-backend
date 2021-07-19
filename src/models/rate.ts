import Seq, {
    Sequelize,
    Model,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin,
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
    Optional,
} from "sequelize";
import {UserAttributes, UserInstance} from "./user.js";
import {MilkRecordAttributes, MilkRecordInstance} from "./milkRecord.js";


export interface RateAttributes {
    id: number;
    startDate: Date;
    endDate: Date;
    rate: number;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;

    // foreign key
    setterId?: number;

    // to access associations when eager loading
    setter?: UserAttributes | UserAttributes["id"][];
    milkRecords?: MilkRecordAttributes | MilkRecordAttributes["id"][];
}

interface RateCreationAttributes extends Optional<RateAttributes, "id"> {}

export interface RateInstance
    extends Model<RateAttributes, RateCreationAttributes>, RateAttributes {
    dataValues?: any;

    // model associations
    getSetter: BelongsToGetAssociationMixin<UserInstance>;
    setSetter: BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
    createSetter: BelongsToCreateAssociationMixin<UserAttributes>;

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
}


export const RateFactory = (sequelize: Sequelize) => {
    const {DataTypes} = Seq;
    const Rate = sequelize.define<RateInstance>("Rate", {
        id: {
            type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true,
            unique: true, allowNull: false
        },
        startDate: {
            type: DataTypes.DATEONLY, allowNull: false, defaultValue: Seq.NOW
        },
        endDate: {
            type: DataTypes.DATEONLY, allowNull: false, defaultValue: Seq.NOW
        },
        rate: {
            type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00
        }
    }, {
        tableName: "rates",
        underscored: true,
    });


    // @ts-ignore
    Rate.associate = (models: any) => {
        Rate.belongsTo(models.User, {
            as: "setter",
            foreignKey: "setterId"
        });

        Rate.hasMany(models.MilkRecord, {
            foreignKey: {
                name: "rateId",
                allowNull: false
            },
            onDelete: "RESTRICT",
            onUpdate: "CASCADE"
        });
    }
    return Rate;
}
