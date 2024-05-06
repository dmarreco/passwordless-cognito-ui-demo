<script setup>
import { ref, onMounted } from 'vue'
import { Amplify, Auth } from 'aws-amplify'

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_keHTt6H7b',
    userPoolWebClientId: '69at0qspalm5l7n885qr7eq898',
    mandatorySignIn: false
  }
})

const email = ref('')
const signInStep = ref('SEND_MAGIC_LINK')
const isSignedIn = ref(false)
let cognitoUser


async function sendMagicLink() {
  const response = await fetch('https://api.dev.gethomecloud.com/users/login-nopwd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email.value
    })
  }).catch(err => {
    alert(`Failed to send magic link: ${err.message}`)
  })

  if (response.status !== 204) {
    const responseBody = await response.json()
    alert(`Failed to send magic link: ${responseBody.message}`)
  } else {
    signInStep.value = 'SENT_MAGIC_LINK'
  }
}

async function signIn(email) {
  try {
    cognitoUser = await Auth.signIn(email)
    console.log(cognitoUser)

    signInStep.value = 'CUSTOM_CHALLENGE'
  } catch (error) {
    alert(error.message)
  }
}

async function answerCustomChallenge(token) {
  try {
    const challengeResult = await Auth.sendCustomChallengeAnswer(cognitoUser, token)
    console.log('challenge result')
    console.log(challengeResult)
    isSignedIn.value = true
  } catch (error) {
    console.log(error)
    signInStep.value = 'SIGN_IN'
    alert(`The token is invalid.`)
  }  
}

async function signOut() {
  await Auth.signOut()
  cognitoUser = null
  isSignedIn.value = false
  signInStep.value = 'SEND_MAGIC_LINK'

  console.log(await Auth.currentUserInfo())
}

onMounted(async () => {  
  // the search string looks like "?email=xxx&token=yyy"
  if (window.location.search) {
    const qs = window.location.search.substring(1)
    const qsParams = qs.split(['&'])
    const qsEmail = qsParams.find(x => x.startsWith('email='))
    const qsToken = qsParams.find(x => x.startsWith('token='))
    if (qsToken) {
      const email = decodeURIComponent(qsEmail.substring(6))
      await signIn(email)
      
      const token = decodeURIComponent(qsToken.substring(6))
      console.log(token)
      await answerCustomChallenge(token)
    }
  }  
})
</script>

<template>

  <div>
    <h1 class="font-bold text-4xl mb-12"></h1>

    <div class="w-1/2 flex-row mb-10">
      <h2 class="font-semibold text-xl">sign in with magic links</h2>

      <input 
        v-model="email" 
        type="text"
        class="mt-2 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Email address">

      <button v-if="signInStep === 'SEND_MAGIC_LINK'"
        @click="sendMagicLink"
        class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Send magic link
      </button>
      
      <p v-if="signInStep === 'SENT_MAGIC_LINK'">Check your email for a magic link.</p>
    </div>

    <div v-if="isSignedIn" class="w-1/2 flex-row mb-10">
      <h2 class="font-semibold text-xl">You're signed in! Sign out and try again.</h2>

      <button v-if="isSignedIn"
        @click="signOut" 
        class="mt-2 py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Sign out
      </button>
    </div>
  </div>


</template>