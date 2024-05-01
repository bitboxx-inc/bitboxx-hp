<template>
  <v-app>
    <v-app-bar flat>
      <v-btn density="compact" variant="text" style="text-transform: none;" href="https://bitboxx.co.jp">
        株式会社bitboxx
      </v-btn>
      <v-divider color="#0000"/>

      <v-btn
          v-if="$vuetify.display.mdAndUp"
          v-for="item in links" :key="item.name"
          class="mx-1"
          density="compact"
          variant="text"
          :to="item.path">{{ item.name }}</v-btn>
      <v-app-bar-nav-icon density="compact" v-else @click="showDrawer = !showDrawer" class="mx-1" />
      <v-spacer/>
    </v-app-bar>

    <v-navigation-drawer v-if="$vuetify.display.mdAndDown" app fixed clipped v-model="showDrawer">
      <!-- Content for the sidebar here -->
      <v-card elevation="0" v-for="path in links" :key="path" tile class="py-5 pl-3" :to="path.path">
<!--        {{ $t(path.name) }}-->
        {{ path.name }}
      </v-card>
    </v-navigation-drawer>


    <v-main>
      <router-view/>
    </v-main>
    <v-footer app theme="dark">
      <v-row>
        <v-col cols="12">
          <v-card align="center" class="pt-10" flat color="#0000">
            プライバシーと利用規約
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card align="right" class="pt-10" flat color="#0000">
            2024 &copy; bitboxx Inc.
          </v-card>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>

import {onMounted, ref} from "vue";
import router from "@/router";

const showDrawer = ref(false);

const links = [
  {
    "name": "会社概要",
    "path": ""
  },
  {
    "name": "サービス",
    "path": ""
  },
  {
    "name": "ニュース",
    "path": ""
  },
  {
    "name": "お問い合わせ",
    "path": ""
  }
]

// TODO あとではずす
// onMounted(() => {
//   window.location.href = 'https://tools.bitboxx.co.jp'
// })
</script>
