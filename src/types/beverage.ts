// src/types/beverage.ts

export interface BaseBeverageType {
  id: string;
  name: string;
  color: string;
}

export interface CreamerType {
  id: string;
  name: string;
  color: string;
}

export interface SyrupType {
  id: string;
  name: string;
  color: string;
}

export type BeverageType = {
  id: string;                 // Firestore document id
  uid: string;                // Firebase user id (owner)
  name: string;
  temperature: string;        // e.g. "hot", "cold"
  base: BaseBeverageType;
  syrup: SyrupType;
  creamer: CreamerType;
};
