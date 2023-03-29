<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-tabs v-model="tab" direction="vertical" hide-slider>
          <v-tab value="profil" color="buttonBack" variant="elevated">
            Profil
          </v-tab>
          <v-tab value="commandes" color="buttonBack" variant="elevated">
            Commandes
          </v-tab>
          <v-tab value="favoris" color="buttonBack" variant="elevated">
            Favoris
          </v-tab>
        </v-tabs>
      </v-col>
      <v-col cols="12" md="9">
        <v-window v-model="tab">
          <v-window-item value="profil">
            <v-card rounded="0">
              <v-card-title class="d-flex justify-space-between align-center">
                <h2 class="text-h5">
                  Mon profil
                </h2>
                <v-btn icon="mdi-dots-vertical" variant="text" @click="openDeleteUser = !openDeleteUser" />
              </v-card-title>
              <v-card-text>
                <v-form @submit.prevent="updateProfile">
                  <div class="d-flex">
                    <v-text-field
                      v-model="firstName"
                      :disabled="!change"
                      type="text"
                      label="Prénom"
                      variant="outlined"
                    />
                    <v-text-field
                      v-model="lastName"
                      :disabled="!change"
                      type="text"
                      label="Nom"
                      variant="outlined"
                      class="ml-2"
                    />
                    <v-btn
                      class="ml-2"
                      icon="mdi-pencil"
                      variant="text"
                      @click="isChange()"
                    />
                  </div>
                  <v-btn
                    v-if="change"
                    block
                    type="submit"
                    color="buttonBack"
                    :loadind="loading"
                  >
                    Modifier
                  </v-btn>
                </v-form>
              </v-card-text>
              <v-divider />
              <v-card-title class="text-left">
                <h2 class="text-h5">
                  Sortir du club
                </h2>
              </v-card-title>
              <v-card-text>
                <span>Tu vas nous manquer, reviens vite!</span>
                <v-btn
                  class="mt-2"
                  block
                  color="highlight"
                  :disabled="loading"
                  @click="logout"
                >
                  Se déconnecter
                </v-btn>
                <v-btn
                  v-if="openDeleteUser"
                  class="mt-4"
                  block
                  color="buttonBack"
                  variant="outlined"
                  :disabled="loading"
                  @click="deleteProfile"
                >
                  Supprimer votre compte
                </v-btn>
                <v-btn
                  v-if="userClaims?.admin"
                  class="mt-4"
                  block
                  color="buttonText"
                  to="/admin"
                >
                  Espace d'administration
                </v-btn>
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item value="commandes">
            commandes
          </v-window-item>
          <v-window-item value="favoris">
            favoris
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { deleteUser, getIdTokenResult, signOut } from '@firebase/auth'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { userConverter } from '~/stores'

const { $notifier } = useNuxtApp()
const auth = useFirebaseAuth()
const user = useCurrentUser()
const db = useFirestore()

const userClaims = ref()
const tab = ref(null)
const loading = ref(false)
const change = ref(false)
const openDeleteUser = ref(false)
const firstName = ref<string>()
const lastName = ref<string>()

function isChange () {
  if (!change.value) {
    change.value = true
  } else {
    change.value = false
  }
}

onMounted(async () => {
  if (!user.value) { return }
  const userId = user.value.uid
  const userRef = doc(db, 'users', userId).withConverter(userConverter)
  const userDoc = await getDoc(userRef)
  const userFetched = userDoc.data()
  if (userFetched) {
    firstName.value = userFetched.firstName
    lastName.value = userFetched.lastName
  }

  const { claims } = await getIdTokenResult(user.value, true)
  userClaims.value = claims
})

async function updateProfile () {
  loading.value = true
  try {
    if (user.value) {
      const userId = user.value.uid
      const userRef = doc(db, 'users', userId).withConverter(userConverter)
      await setDoc(userRef, { firstName: firstName.value, lastName: lastName.value }, { merge: true })
      $notifier({
        content: 'Profil mis à jour',
        color: 'main'
      })
    }
  } catch (error) {
    $notifier({
      content: 'Une erreur est survenue lors de la mise à jour de vos informations',
      color: 'error',
      error
    })
  } finally {
    change.value = false
    loading.value = false
  }
}

async function deleteProfile () {
  if (!user.value) { return }
  loading.value = true

  try {
    const userRef = doc(db, 'users', user.value.uid)
    await deleteDoc(userRef)
    await deleteUser(user.value)
  } catch (error) {
    $notifier({
      content: 'Une erreur est survenue lors de la suppression de votre compte',
      color: 'error',
      error
    })
  } finally {
    loading.value = false
  }
}

async function logout () {
  if (!auth) { return }
  loading.value = true

  try {
    await signOut(auth)
    await navigateTo('/')
  } catch (error) {
    $notifier({
      content: 'Une erreur est survenue lors de la déconnexion',
      color: 'error',
      error
    })
  } finally {
    loading.value = false
  }
}
</script>
