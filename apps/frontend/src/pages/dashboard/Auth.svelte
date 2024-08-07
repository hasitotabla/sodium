<script lang="ts">
  import { navigate } from "svelte-routing";

  import { fetch } from "$lib/fetch";
  import { userStore } from "src/stores/User";
  import { type SharedUser } from "$shared/types/User";
  import { type ApiError } from "$shared/types/Axios";
  import { showToast } from "$components/_partial/toast/_Toast";
  import { onMount } from "svelte";

  let email: string;
  let password: string;
  let passwordAgain: string;
  let inviteCode: string;

  let isInviteRequired = false;
  let isRegistrationOpen = false;

  let invalidFields: { [key: string]: string } = {};
  let isRequestPending = false;
  let isRegister = false;

  const displayError = (err: ApiError) => {
    if (!err.additionalInfo) return;

    for (const value of err.additionalInfo) {
      if (!invalidFields[value.parameters]) {
        invalidFields[value.parameters] = `- ${value.message}`;
      }
    }

    setTimeout(() => {
      isRequestPending = false;
      invalidFields = {};
    }, 4000);
  };

  const onLogin = async () => {
    if (isRequestPending) return;
    isRequestPending = true;

    const response = await fetch("/auth/login", {
      method: "POST",
      data: {
        email,
        password,
      },
    });

    if (!response.success) {
      displayError(response.data);
      return;
    }

    const { accessToken, refreshToken, user } = response.data;

    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    userStore.set(user);

    navigate("/dashboard");
  };

  const onRegister = async () => {
    if (password !== passwordAgain) {
      return;
    }

    const response = await fetch("/auth/register", {
      method: "POST",
      data: {
        email,
        password,
        inviteCode,
      },
    });

    if (!response.success) {
      displayError(response.data);
      return;
    }

    isRegister = false;
  };

  onMount(async () => {
    const response = await fetch("/auth/settings");
    if (!response.success) {
      return;
    }

    isInviteRequired = response.data.inviteRequired;
    isRegistrationOpen = response.data.registrationOpen;
  });
</script>

<div class="container">
  <h1 class="header">{isRegister ? "Sign up" : "Sign in"}</h1>

  <div class="input-group mt-3">
    <label for="email" class={invalidFields.email && "error"}>Email {invalidFields.email || ""}</label>
    <input type="text" id="email" bind:value={email} />
  </div>

  <div class="input-group">
    <label for="password" class={invalidFields.password && "error"}>Password {invalidFields.password || ""}</label>
    <input type="password" id="password" bind:value={password} />
  </div>

  {#if isRegister}
    <div class="input-group">
      <label for="password_again" class={invalidFields.password_again && "error"}>
        Password (again) {invalidFields.password_again || ""}
      </label>
      <input type="password" id="password_again" bind:value={passwordAgain} />
    </div>

    {#if isInviteRequired}
      <div class="input-group">
        <label for="invite_code" class={invalidFields.invite_code && "error"}>
          Invite code {invalidFields.invite_code || ""}
        </label>
        <input type="text" id="invite_code" bind:value={inviteCode} />
      </div>
    {/if}
  {/if}

  <div class="actions">
    <button class="transparent" on:click={isRegister ? onRegister : onLogin}>{isRegister ? "Register" : "Login"}</button>

    {#if isRegistrationOpen}
      <a class="link ml-5" on:click={() => (isRegister = !isRegister)} type="button" role="presentation">
        {isRegister ? "Already have an account?" : "Don't have an account?"}
      </a>
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: min(90%, 280px);

    padding: 1rem;

    border: 1px solid #222222;
    border-radius: 8pt;
  }
</style>
