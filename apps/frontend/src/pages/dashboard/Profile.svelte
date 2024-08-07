<script lang="ts">
  import DashboardPage from "$components/_partial/DashboardPage.svelte";
  import { fetch } from "$lib/fetch";
  import type { ApiError } from "$shared/index";

  let isRequestPending = false;

  let fields: { [key: string]: string } = {
    currentPassword: "",
    newPassword: "",
    newPasswordAgain: "",
  };
  let invalidFields: { [key: string]: string } = {};

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

  const onPasswordChange = async () => {
    if (fields.newPassword !== fields.newPasswordAgain) {
      invalidFields.newPasswordAgain = "Passwords do not match";
      return;
    }

    const response = await fetch("/auth/passwordChange", {
      method: "PUT",
      data: {
        currentPassword: fields.currentPassword,
        newPassword: fields.newPassword,
      },
    });
    if (!response.success) {
      // displayError(response.data);
      return;
    }
  };
</script>

<DashboardPage>
  <div class="container">
    <div class="category">
      <form action="#">
        <p class="label">Password change</p>
        <div class="input-group">
          <label for="current_password" class={invalidFields.currentPassword && "error"}>
            Current password {invalidFields.currentPassword || ""}
          </label>
          <input type="password" id="current_password" autocomplete="current-password" bind:value={fields.currentPassword} />
        </div>
        <div class="input-group">
          <label for="new_password" class={invalidFields.newPassword && "error"}>
            New password {invalidFields.newPassword || ""}
          </label>
          <input type="password" id="new_password" autocomplete="new-password" bind:value={fields.newPassword} />
        </div>
        <div class="input-group">
          <label for="new_password_again" class={invalidFields.newPasswordAgain && "error"}>
            New password (again) {invalidFields.newPasswordAgain || ""}
          </label>
          <input type="password" id="new_password_again" autocomplete="new-password" bind:value={fields.newPasswordAgain} />
        </div>

        <button type="submit" on:click|preventDefault={onPasswordChange}>Change password</button>
      </form>
    </div>
  </div>
</DashboardPage>

<style lang="scss">
  .container {
    width: min(1100px, 90%);
    margin: 2em auto;

    .category {
      .label {
        font-size: 1.5rem;
        font-weight: 500;
        margin-bottom: 1rem;
      }
    }
  }
</style>
