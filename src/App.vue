<template>
  <div>
    <!-- AUTH HEADER -->
    <header style="margin-bottom: 1.5rem; color: white;">
      <h1>Brew Portal</h1>

      <div v-if="!beverageStore.user">
        <button @click="loginWithGoogle">Sign in with Google</button>
      </div>

      <div v-else>
        <span>
          Signed in as:
          {{ beverageStore.user.displayName || beverageStore.user.email }}
        </span>
        <button style="margin-left: 0.5rem;" @click="logout">
          Sign out
        </button>
      </div>

      <p v-if="beverageStore.message" style="margin-top: 0.5rem;">
        {{ beverageStore.message }}
      </p>
    </header>

    <!-- Mug display using old visual components -->
    <Beverage
      :isIced="isIced"
      :base="baseKey"
      :creamer="creamerKey"
      :syrup="syrupKey"
    />

    <!-- Temperature (from store.temps) -->
    <ul>
      <li>
        <template v-for="temp in beverageStore.temps" :key="temp">
          <label>
            <input
              type="radio"
              name="temperature"
              :id="`temp-${temp}`"
              :value="temp"
              v-model="beverageStore.currentTemp"
            />
            {{ temp }}
          </label>
        </template>
      </li>
    </ul>

    <!-- Bases (from Firestore) -->
    <ul>
      <li>
        <template v-for="b in beverageStore.bases" :key="b.id">
          <label>
            <input
              type="radio"
              name="bases"
              :id="`base-${b.id}`"
              :value="b"
              v-model="beverageStore.currentBase"
            />
            {{ b.name }}
          </label>
        </template>
      </li>
    </ul>

    <!-- Creamers (from Firestore) -->
    <ul>
      <li>
        <template v-for="c in beverageStore.creamers" :key="c.id">
          <label>
            <input
              type="radio"
              name="creamers"
              :id="`creamer-${c.id}`"
              :value="c"
              v-model="beverageStore.currentCreamer"
            />
            {{ c.name }}
          </label>
        </template>
      </li>
    </ul>

    <!-- Syrups (from Firestore) -->
    <ul>
      <li>
        <template v-for="s in beverageStore.syrups" :key="s.id">
          <label>
            <input
              type="radio"
              name="syrups"
              :id="`syrup-${s.id}`"
              :value="s"
              v-model="beverageStore.currentSyrup"
            />
            {{ s.name }}
          </label>
        </template>
      </li>
    </ul>

    <!-- Beverage Name Input -->
    <input
      type="text"
      placeholder="Beverage Name"
      v-model="beverageStore.currentName"
      style="margin-top: 10px; display: block;"
    />

    <!-- Make beverage (saves to Firestore) -->
    <button
      style="margin-top: 10px;"
      @click="beverageStore.makeBeverage()"
      :disabled="!beverageStore.user"
    >
      Make Beverage
    </button>

    <p v-if="!beverageStore.user" style="color: white; margin-top: 0.5rem;">
      Please sign in to make and save beverages.
    </p>

    <!-- Saved Beverages (ONLY when logged in) -->
    <div
      v-if="beverageStore.user"
      id="beverage-container"
      style="margin-top: 30px; padding-top: 20px;"
    >
      <h2 style="color: white;">Saved Beverages</h2>

      <div v-if="beverageStore.beverages.length === 0" style="color: white;">
        No saved beverages yet.
      </div>

      <div v-else>
        <label
          v-for="bev in beverageStore.beverages"
          :key="bev.id"
          style="display: block; color: white; margin: 6px 0;"
        >
          <input
            type="radio"
            name="saved-beverages"
            :value="bev.id"
            :checked="beverageStore.currentBeverage?.id === bev.id"
            @change="beverageStore.showBeverage(bev.id)"
          />
          {{ bev.name }} — {{ bev.temperature }} {{ bev.base.name }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Beverage from "./components/Beverage.vue";
import { useBeverageStore } from "./stores/beverageStore";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const beverageStore = useBeverageStore();

/**
 * Login / Logout
 */
async function loginWithGoogle() {
  try {
    await signInWithPopup(auth, googleProvider);
    // onAuthStateChanged in main.ts will call store.setUser(user)
  } catch (e: any) {
    beverageStore.message = e?.message ?? "Login failed.";
  }
}

async function logout() {
  await signOut(auth);
}

/**
 * Temperature: your old UI uses "cold" to show iced.
 */
const isIced = computed(() => {
  const t = beverageStore.currentTemp;
  return typeof t === "string" && t.toLowerCase() === "cold";
});

/**
 * Map Firestore base objects to the old string keys
 * that Base.vue expects: "coffee", "green-tea", "black-tea".
 */
const baseKey = computed(() => {
  const base = beverageStore.currentBase;
  if (!base) return "";

  switch (base.name.trim()) {
    case "Coffee":
      return "coffee";
    case "Green Tea":
      return "green-tea";
    case "Black Tea":
      return "black-tea";
    default:
      console.warn("Unknown Firestore base:", base.name);
      return "";
  }
});

/**
 * Map Firestore creamer objects to Creamer.vue keys:
 * "milk", "cream", "half-half", "none".
 */
const creamerKey = computed(() => {
  const creamer = beverageStore.currentCreamer;
  if (!creamer) return "none";

  const name = creamer.name.toLowerCase();
  if (name.includes("no") && name.includes("cream")) return "none";
  if (name.includes("milk")) return "milk";
  if (name.includes("half")) return "half-half";
  if (name.includes("cream")) return "cream";
  return "none";
});

/**
 * Map Firestore syrup objects to Syrup.vue keys:
 * "vanilla", "caramel", "hazelnut", "none".
 */
const syrupKey = computed(() => {
  const syrup = beverageStore.currentSyrup;
  if (!syrup) return "none";

  const name = syrup.name.toLowerCase();
  if (name.includes("no") && name.includes("syrup")) return "none";
  if (name.includes("vanilla")) return "vanilla";
  if (name.includes("caramel")) return "caramel";
  if (name.includes("hazelnut")) return "hazelnut";
  return "none";
});
</script>

<style lang="scss">
body,
html {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #6e4228;
  background: linear-gradient(to bottom, #6e4228 0%, #956f5a 100%);
}

ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

li {
  margin-bottom: 0.5rem;
}

input {
  margin: 0 0.25rem;
}
</style>
