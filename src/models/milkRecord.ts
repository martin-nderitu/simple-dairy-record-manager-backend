import Seq, {
    Sequelize,
    Model,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    BelongsToCreateAssociationMixin,
    Optional,
} from "sequelize";
import {UserAttributes, UserInstance} from "./user.js";
import {RateAttributes, RateInstance} from "./rate.js";

const {DataTypes} = Seq;

export interface MilkRecordAttributes {
    id: number;
    amount: number;
    shift: "morning" | "afternoon" | "evening";
    readonly createdAt?: Date;
    readonly updatedAt?: Date;

    // foreign ids
    farmerId?: number;
    milkCollectorId?: number;
    rateId?: number;

    // to access associations when eager loading
    farmer?: UserAttributes | UserAttributes["id"][];
    milkCollector?: UserAttributes | UserAttributes["id"][];
    rate?: RateAttributes | RateAttributes["id"][];
}

interface MilkRecordCreationAttributes extends Optional<MilkRecordAttributes, "id"> {}

export interface MilkRecordInstance
    extends Model<MilkRecordAttributes, MilkRecordCreationAttributes>, MilkRecordAttributes {
    dataValues?: any;

    // model associations
    getFarmer: BelongsToGetAssociationMixin<UserInstance>;
    setFarmer: BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
    createFarmer: BelongsToCreateAssociationMixin<UserAttributes>;

    getMilkCollector: BelongsToGetAssociationMixin<UserInstance>;
    setMilkCollector: BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
    createMilkCollector: BelongsToCreateAssociationMixin<UserAttributes>;

    getRate: BelongsToGetAssociationMixin<RateInstance>;
    setRate: BelongsToSetAssociationMixin<RateInstance, RateInstance["id"]>;
    createRate: BelongsToCreateAssociationMixin<RateAttributes>;
}


export const MilkRecordFactory = (sequelize: Sequelize) => {
    const MilkRecord = sequelize.define<MilkRecordInstance>("MilkRecord", {
        id: {
            type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true,
            unique: true, allowNull: false
        },
        amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false},
        shift: {
            type: DataTypes.ENUM("morning", "afternoon", "evening"),
            allowNull: false
        },
    }, {
        tableName: "milk_records",
        underscored: true,
    });


    // @ts-ignore
    MilkRecord.associate = (models: any) => {
        MilkRecord.belongsTo(models.User, {
            as: "farmer",
            foreignKey: "farmerId"
        });

        MilkRecord.belongsTo(models.User, {
            as: "milkCollector",
            foreignKey: "milkCollectorId"
        });

        MilkRecord.belongsTo(models.Rate, {
            as: "rate",
            foreignKey: {
                name: "rateId",
                allowNull: false
            }
        });
    }
    return MilkRecord;
}

