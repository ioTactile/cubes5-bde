<template>
  <div>
    <v-app-bar color="secondary">
      <v-app-bar-nav-icon v-if="xs" class="mr-4" @click.stop="drawer = !drawer" />
      <v-spacer class="d-block d-sm-none" />
      <NuxtLink to="/">
        <v-app-bar-title class="font-weight-bold text-buttonBack text-h4 ml-sm-12">
          Boutique du BDE
        </v-app-bar-title>
      </NuxtLink>
      <v-spacer />
      <span v-if="username" class="d-none d-sm-block">Bonjour, {{ username }}</span>
      <v-btn icon="mdi-account" size="large" @click="isLogin('/profil')" />
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" width="200">
      <v-list nav class="pa-0">
        <v-list-item v-for="(item, i) in items" :key="i" :value="item" :to="item.link" active-color="highlight">
          {{ item.title }}
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <client-only>
      <Connexion v-model="login" />
    </client-only>
  </div>
</template>

<script lang="ts" setup>
import { onAuthStateChanged } from '@firebase/auth'
import { doc, getDoc } from '@firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import { useDisplay } from 'vuetify'
import { userConverter } from '~/stores'

const db = useFirestore()

const { xs } = useDisplay()
const login = ref(false)
const drawer = ref(false)
const group = ref(null)
const username = ref('')

onMounted(() => {
  const auth = useFirebaseAuth()!
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      return
    }
    const userId = user.uid
    const userRef = doc(db, 'users', userId).withConverter(userConverter)
    const userDoc = await getDoc(userRef)
    const userFetched = userDoc.data()
    if (userFetched) {
      username.value = userFetched.username
    }
  })
})

watch(group, () => {
  drawer.value = false
})

const items = [
  {
    title: 'Accueil',
    link: '/'
  },
  {
    title: 'Boutique',
    link: '/boutique'
  },
  {
    title: 'À propos',
    link: '/a-propos'
  },
  {
    title: 'Contact',
    link: '/contact'
  }
]

const isLogin = (path: string) => {
  const user = useCurrentUser()
  if (!user.value) {
    login.value = true
  } else {
    navigateTo(path)
  }
}
</script>
