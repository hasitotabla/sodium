<script lang="ts">
  import DashboardPage from "$components/_partial/DashboardPage.svelte";
  import Pagination from "$components/_partial/Pagination.svelte";
  import { showToast } from "$components/_partial/toast/_Toast";
  import { fetch } from "$lib/fetch";
  import { type Invite, type InviteCreateResponse, type InviteFetchResponse } from "$shared/types/Invite";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  const INVITE_PER_PAGE = 10;

  let invites: Invite[] | null = null;

  let currentPage = 0;
  let totalPages = 0;

  let inviteCode = "";
  let createdCode: string | null = null;

  const onCreateInvite = async () => {
    if (createdCode) {
      return showToast({
        message: `Please wait 30 seconds before creating another invite code`,
        type: "error",
      });
    }

    const response = await fetch<InviteCreateResponse>("/invites/create", {
      method: "POST",
      data: { code: inviteCode },
    });
    if (!response.success) {
      return showToast({
        message: "Failed to create invite",
        type: "error",
      });
    }

    createdCode = response.data.code;
    setTimeout(() => (createdCode = null), 30000);

    // fetchInvites(currentPage);
  };

  const onDeleteInvite = async (id: number) => {
    const response = await fetch(`/invites/${id}`, { method: "DELETE" });
    if (!response.success) {
      return console.error("Failed to delete invite");
    }

    fetchInvites(currentPage);
  };

  const onPageChange = async (newPage: number) => {
    currentPage = newPage;
    await fetchInvites(currentPage);
  };

  const fetchInvites = async (page: number = currentPage) => {
    const response = await fetch<InviteFetchResponse>(`/invites/all?page=${page}`);
    if (!response.success) {
      if (response.status === 403) navigate("/dashboard");
      return;
    }

    invites = response.data.invites;
    totalPages = Math.ceil(response.data.total / INVITE_PER_PAGE);
  };

  onMount(fetchInvites);
</script>

<DashboardPage>
  {#if invites}
    <div class="container">
      <div class="create input-group">
        <label for="invite_code">Invite code (Leave empty for auto-generate)</label>
        <input type="password" id="invite_code" bind:value={inviteCode} />
        <button on:click={onCreateInvite}>Create</button>
      </div>

      {#if createdCode}
        <div style="margin: 1em 0;">
          <p>Invite code created: {createdCode}</p>
        </div>
      {/if}

      <table class="invites">
        <thead>
          <tr>
            <th>#</th>
            <th>Code</th>
            <th>Created by</th>
            <th>Used by</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each invites as invite}
            <tr class="invite">
              <td class="invite-id">{invite.id}</td>
              <td class="invite-code">{invite.code}</td>
              <td>{invite.createdBy}</td>
              <td>{invite.usedBy}</td>
              <td>
                <button on:click={() => onDeleteInvite(invite.id)}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div style="margin: 1em 0;">
        <Pagination {currentPage} {totalPages} onChange={onPageChange} />
      </div>
    </div>
  {/if}
</DashboardPage>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;

    .create {
      input {
        width: 250px;
      }
    }

    .invites {
      width: min(95%, 1100px);
      border-collapse: collapse;

      thead {
        color: #222;
        background-color: #f5f5f5;
      }

      th {
        padding: 10px;
        text-align: left;
      }

      .invite {
        td {
          padding: 10px;
        }

        .invite-id {
          width: 50px;
        }

        .invite-code {
          width: 200px;
        }
      }
    }
  }
</style>
