// src/stores/beverageStore.ts
import { defineStore } from "pinia";
import type { User } from "firebase/auth";

import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";

import tempretures from "../data/tempretures.json";
import db from "../firebase";

import {
  collection,
  getDocs,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  Unsubscribe,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    // temperature choices
    temps: tempretures as string[],
    currentTemp: (tempretures as string[])[0],

    // ingredient lists
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,

    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,

    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,

    // user-specific beverages
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,

    // name typed into the form
    currentName: "",

    // auth state
    user: null as User | null,

    // UI message (errors / success)
    message: "" as string,

    // Firestore listener handle
    _unsubscribe: null as Unsubscribe | null,
  }),

  actions: {
    /**
     * Load ingredient lists from Firestore.
     * Call this once when the app starts.
     */
    async init() {
      // Bases
      const baseSnap = await getDocs(collection(db, "bases"));
      this.bases = baseSnap.docs.map(
        (d) => d.data() as BaseBeverageType
      );

      // Creamers
      const creamerSnap = await getDocs(collection(db, "creamers"));
      this.creamers = creamerSnap.docs.map(
        (d) => d.data() as CreamerType
      );

      // Syrups
      const syrupSnap = await getDocs(collection(db, "syrups"));
      this.syrups = syrupSnap.docs.map(
        (d) => d.data() as SyrupType
      );

      // Set defaults
      this.currentBase = this.bases[0] ?? null;
      this.currentCreamer = this.creamers[0] ?? null;
      this.currentSyrup = this.syrups[0] ?? null;
    },

    /**
     * Called from onAuthStateChanged(auth, user).
     * - Saves user
     * - Stops previous beverages listener
     * - Starts new listener for this user's beverages
     */
    setUser(user: User | null) {
      this.user = user;

      // stop previous listener if any
      if (this._unsubscribe) {
        this._unsubscribe();
        this._unsubscribe = null;
      }

      // if logged out: clear beverages and current selection
      if (!user) {
        this.beverages = [];
        this.currentBeverage = null;
        this.message = "";
        return;
      }

      // new listener for this user's beverages
      const beveragesRef = collection(db, "beverages");
      const q = query(beveragesRef, where("uid", "==", user.uid));

      this._unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const list: BeverageType[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Omit<BeverageType, "id">;
            return {
              id: docSnap.id,
              ...data,
            };
          });

          this.beverages = list;

          // keep current beverage if possible
          if (this.currentBeverage) {
            const stillThere = list.find(
              (b) => b.id === this.currentBeverage!.id
            );
            this.currentBeverage = stillThere ?? list[0] ?? null;
          } else {
            this.currentBeverage = list[0] ?? null;
          }
        }
      );
    },

    /**
     * Create a new beverage for the current user.
     * Returns a message describing what happened.
     */
    async makeBeverage(): Promise<string> {
      // must be logged in
      if (!this.user) {
        this.message = "No user logged in, please sign in first.";
        return this.message;
      }

      // must have all fields filled
      if (
        !this.currentTemp ||
        !this.currentBase ||
        !this.currentCreamer ||
        !this.currentSyrup ||
        !this.currentName.trim()
      ) {
        this.message =
          "Please complete all beverage options and the name before making a beverage.";
        return this.message;
      }

      const uid = this.user.uid;
      const name = this.currentName.trim();

      // build a unique id
      const id = `${uid}-${Date.now()}`;

      // what we actually store in Firestore
      const data: Omit<BeverageType, "id"> = {
        uid,
        name,
        temperature: this.currentTemp,
        base: this.currentBase,
        creamer: this.currentCreamer,
        syrup: this.currentSyrup,
      };

      const newBeverage: BeverageType = {
        id,
        ...data,
      };

      // optimistic UI update
      this.beverages.push(newBeverage);
      this.currentBeverage = newBeverage;

      // write to Firestore
      const beveragesRef = collection(db, "beverages");
      const docRef = doc(beveragesRef, id);
      await setDoc(docRef, data);

      this.currentName = "";
      this.message = `Beverage ${name} made successfully!`;
      return this.message;
    },

    /**
     * Show an existing beverage in the preview and update form controls.
     */
    showBeverage(id: string) {
      const bev = this.beverages.find((b) => b.id === id);
      if (!bev) return;

      this.currentBeverage = bev;

      this.currentTemp = bev.temperature;
      this.currentBase = bev.base;
      this.currentCreamer = bev.creamer;
      this.currentSyrup = bev.syrup;
      this.currentName = bev.name;
    },
  },
});
