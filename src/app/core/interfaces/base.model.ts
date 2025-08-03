import { EntityId } from "../types";

export interface BaseModel {
    id: EntityId;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}
