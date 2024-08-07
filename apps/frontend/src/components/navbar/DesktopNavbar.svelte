<script lang="ts">
  import { fade } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { Router, links } from "svelte-routing";
  import Fa from "svelte-fa";
  import { faEnvelope, faRightToBracket, faServer, faUserCog, faUsers } from "@fortawesome/free-solid-svg-icons";
  import { sha256 } from "js-sha256";

  import { userStore } from "src/stores/User";
  import { logout } from "$lib/user";
  import { PermissionLevel } from "$shared/index";

  export let avatarUrl: string | null = null;
  export let isAdmin = false;

  let isDropdownOpened = false;
</script>

<div class="nav-desktop" use:links>
  <Router>
    <a href="/dashboard" class="route">Home</a>
    <a href="/dashboard/upload" class="route">Upload</a>
    <a href="/dashboard/files" class="route">Files</a>

    <div class="profile">
      <img src={avatarUrl} alt="" class="avatar" on:click={() => (isDropdownOpened = !isDropdownOpened)} role="presentation" />
      {#if isDropdownOpened}
        <div
          class="dropdown"
          transition:fade={{
            duration: 350,
            easing: quartOut,
          }}
        >
          {#if isAdmin}
            <div class="category">
              <p class="label">Admin</p>
              <div class="list">
                <a href="/dashboard/admin/users">
                  <Fa icon={faUsers} />
                  Users
                </a>
                <a href="/dashboard/admin/invites">
                  <Fa icon={faEnvelope} />
                  Invites
                </a>
                <a href="/dashboard/admin/settings">
                  <Fa icon={faServer} />
                  Instance Settings
                </a>
              </div>
            </div>
          {/if}

          <a href="/dashboard/profile">
            <Fa icon={faUserCog} />
            User settings
          </a>

          <a href="#" on:click={logout} role="presentation">
            <Fa icon={faRightToBracket} />
            Logout
          </a>
        </div>
      {/if}
    </div>
  </Router>
</div>

<style lang="scss">
  .nav-desktop {
    // position: relative;

    display: flex;
    justify-content: center;
    align-items: center;

    @media (max-width: 768px) {
      display: none;
    }

    a.route {
      margin: 0 10px;

      color: #ddd;
      text-decoration: none;

      &:hover {
        color: #fff;
      }
    }

    .profile {
      display: block;
      position: relative;

      .avatar {
        width: 28px;
        height: 28px;

        border-radius: 50%;
        margin-left: 10px;

        cursor: pointer;
      }

      .dropdown {
        position: absolute;
        top: 2.5em;
        right: 0;

        min-width: 150px;

        display: flex;
        flex-direction: column;

        padding: 10px;

        border-radius: 10px 4px 10px 10px;

        background: #151515;
        color: #ddd;

        z-index: 999;

        a {
          font-size: 14px;

          color: #aaa;
          text-decoration: none;
          transition: 150ms color ease-in-out;

          &:hover {
            color: #fff;
          }

          &:not(:last-child) {
            margin-bottom: 5px;
          }
        }

        .category {
          display: flex;
          flex-direction: column;

          margin: 0 0 1em 0;

          .label {
            color: #888;
            font-size: 18px;
            margin-bottom: 5px;
          }

          .list {
            display: flex;
            flex-direction: column;

            margin-left: 10px;

            a {
              color: #aaa;

              &:hover {
                color: #fff;
              }

              &:not(:last-child) {
                margin-bottom: 5px;
              }
            }
          }
        }
      }
    }
  }
</style>
