<template>
  <v-dialog
    width="500"
    :model-value="modelValue"
    :persistent="loading !== null"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <v-card color="main">
      <v-card-title class="d-flex align-center">
        <span class="text-h5 mr-auto">
          Venez vous régaler !
        </span>
        <v-btn
          icon="mdi-close"
          variant="text"
          :disabled="loading !== null"
          @click="emits('update:modelValue', false)"
        />
      </v-card-title>
      <v-tabs v-model="tab" grow color="buttonBack">
        <v-tab value="one" class="text-capitalize" @click="createAccount = false">
          Connexion
        </v-tab>
        <v-tab value="two" class="text-capitalize" @click="createAccount = true">
          Inscription
        </v-tab>
      </v-tabs>
      <v-card-text>
        <v-form ref="form" @submit.prevent="login">
          <v-window v-model="tab">
            <v-window-item value="one">
              <template v-if="!createAccount">
                <InputsEmail v-model="email" variant="outlined" icon class="mt-2" name="email" />
                <InputsPassword v-if="!forgotPassword" v-model="password" variant="outlined" />
              </template>
              <div class="d-flex justify-center mb-10">
                <v-btn
                  class="text-lowercase"
                  variant="text"
                  @click="forgotPassword = !forgotPassword"
                >
                  {{ forgotPassword ? 'Retour' : 'Mot de passe oublié' }}
                </v-btn>
              </div>
            </v-window-item>

            <v-window-item value="two">
              <template v-if="createAccount">
                <InputsEmail v-model="email" variant="outlined" icon class="mt-2" name="createEmail" />
                <InputsPasswordFirst v-model="password" variant="outlined" />
              </template>
            </v-window-item>
          </v-window>
          <v-btn
            block
            color="buttonBack"
            type="submit"
            :disabled="loading !== null && loading !== 'email'"
            :loading="loading === 'email'"
          >
            {{
              createAccount
                ? "M'inscire"
                : forgotPassword
                  ? 'Réinitialiser mon mot de passe'
                  : 'Connexion'
            }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { VForm } from 'vuetify/components'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  AuthErrorCodes,
  getIdTokenResult,
  ParsedToken
} from 'firebase/auth'
import { FirebaseError } from '@firebase/util'
import { Timestamp, doc, setDoc } from 'firebase/firestore'
import { useFirestore, useCurrentUser, useFirebaseAuth } from 'vuefire'
import { userConverter } from '~/stores'

const { $notifier } = useNuxtApp()
const db = useFirestore()
const user = useCurrentUser()
const auth = useFirebaseAuth()

defineProps<{
  modelValue: boolean
}>()

const emits = defineEmits<{(e: 'update:modelValue', value: boolean): void }>()

const email = ref('')
const password = ref('')
const userClaims = ref<null | ParsedToken>(null)
const date = ref(new Date(Date.now()))
const createAccount = ref(false)
const forgotPassword = ref(false)
const loading = ref<'email' | null>(null)
const form = ref<VForm>()
const tab = ref(null)

onBeforeMount(async () => {
  if (user.value) {
    const { claims } = await getIdTokenResult(user.value, true)
    userClaims.value = claims
  }
})

const login = async () => {
  if (!auth || !(await form.value?.validate())?.valid) {
    return
  }
  loading.value = 'email'
  try {
    if (createAccount.value) {
      createUserWithEmailAndPassword(auth, email.value, password.value).then(
        (credentials) => {
          const userRef = doc(db, 'users', credentials.user.uid).withConverter(
            userConverter
          )
          setDoc(
            userRef,
            {
              id: credentials.user.uid,
              email: email.value,
              creationDate: Timestamp.fromDate(date.value),
              updateDate: Timestamp.now()
            },
            { merge: true }
          )
        }
      )
      $notifier({ content: 'Inscription réussie', color: 'success' })
    } else if (forgotPassword.value) {
      await sendPasswordResetEmail(auth, email.value)
      $notifier({
        content: 'Un email de réinitialisation a été envoyé',
        color: 'success'
      })
      forgotPassword.value = false
    } else {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
      )
      const { claims } = await getIdTokenResult(userCredentials.user, true)
      if (claims.admin) {
        navigateTo('/admin')
      }
    }
    emits('update:modelValue', false)
  } catch (error: unknown) {
    if (!(error instanceof FirebaseError)) {
      throw error
    }

    let errMessage
    switch (error.code) {
      case AuthErrorCodes.EMAIL_EXISTS:
        errMessage = 'Adresse mail déjà utilisée'
        break
      case AuthErrorCodes.USER_DELETED:
        errMessage = 'Utilisateur supprimé'
        break
      case AuthErrorCodes.INVALID_PASSWORD:
        errMessage = 'Mot de passe incorrect'
        break
      default:
        errMessage = 'une erreur est survenue'
        break
    }
    $notifier({ content: errMessage, color: 'error', error })
  } finally {
    loading.value = null
  }
}
</script>
