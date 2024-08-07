<script lang="ts">
  import { links, navigate, Router } from "svelte-routing";
  import { slide } from "svelte/transition";
  import Fa from "svelte-fa";
  import { faArrowUpFromBracket, faEnvelope, faFile, faHome, faRightToBracket, faServer, faUsers } from "@fortawesome/free-solid-svg-icons";

  import { logout } from "$lib/user";

  export let userEmail: string | null = null;
  export let avatarUrl: string | null = null;
  export let isAdmin = false;
</script>

<div
  class="nav-mobile"
  transition:slide={{
    axis: "x",
  }}
>
  <div class="user">
    <div class="info" on:click={() => navigate("/dashboard/profile")} role="presentation">
      <img src={avatarUrl} alt="User Avatar" />
      <p class="email">{userEmail}</p>
    </div>

    <button on:click={() => logout()}>
      <Fa icon={faRightToBracket} />
    </button>
  </div>

  <div class="routes" use:links>
    <Router>
      <a href="/dashboard" class="route">
        <Fa icon={faHome} />
        Home
      </a>
      <a href="/dashboard/upload" class="route">
        <Fa icon={faArrowUpFromBracket} />
        Upload
      </a>
      <a href="/dashboard/files" class="route">
        <Fa icon={faFile} />
        Files
      </a>

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
    </Router>
  </div>
</div>

<style lang="scss">
  $navbarHeight: 54px;
  $distFromSide: 10%;

  @keyframes slideFromBottom {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }

  .nav-mobile {
    position: fixed;
    top: $navbarHeight;
    right: 0;

    width: min(250px, calc(100% - $distFromSide));
    height: calc(100vh - $navbarHeight);

    // animation: slideFromBottom 0.3s ease-in-out;

    z-index: 9999;
    white-space: nowrap;

    background: #121212;
    color: #ddd;

    @media (min-width: 768px) {
      display: none;
    }

    .user {
      display: flex;
      justify-content: space-between;
      align-items: center;
      //   flex-wrap: wrap;

      padding: 10px 10px;

      .info {
        display: flex;
        align-items: center;

        img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 10px;
        }

        .email {
          font-size: 14px;
        }
      }

      button {
        width: 32px;
        height: 32px;

        display: flex;
        align-items: center;
        justify-content: center;

        text-align: center;

        background: none;
        border: none;
        color: #ddd;
        // font-size: 16px;
      }
    }

    .routes {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .route {
        margin: 10px 0;

        color: #ddd;
        text-decoration: none;

        &:hover {
          color: #fff;
        }
      }

      .category {
        // margin: 10px 0;

        .label {
          margin-bottom: 1em;

          font-size: 14px;
          color: #aaa;
          text-align: center;
        }

        .list {
          display: flex;
          flex-direction: column;
          align-items: center;

          a {
            margin: 5px 0;

            color: #ddd;
            text-decoration: none;

            &:hover {
              color: #fff;
            }
          }
        }
      }
    }
  }
</style>
