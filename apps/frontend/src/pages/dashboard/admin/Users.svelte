<script lang="ts">
  import { onMount } from "svelte";

  import DashboardPage from "$components/_partial/DashboardPage.svelte";
  import Pagination from "$components/_partial/Pagination.svelte";
  import { showToast } from "$components/_partial/toast/_Toast";
  import { fetch } from "$lib/fetch";
  import { convertToFileSize } from "$shared/index";
  import { type IRequest } from "$shared/Requests";
  import { convertFileSize } from "$lib/file";

  const PAGE_SIZES = [15, 30, 50, 100];
  const DEFAULT_PAGE_SIZE_INDEX = 0;

  let users: IRequest["/users/all"]["users"] | null = null;
  let totalNumOfUsers = 0;

  let page = 0;
  let pageSize = PAGE_SIZES[DEFAULT_PAGE_SIZE_INDEX];
  let search = "";

  const onChangeUserUploadLimit = async (userId: number) => {
    const newLimit = prompt("Enter new upload limit for this user");
    if (newLimit === null) {
      return;
    }

    const parsedLimit = convertToFileSize(newLimit);
    if (parsedLimit === null) {
      return showToast({ message: "Invalid file size", type: "error" });
    }

    const response = await fetch<IRequest["/users/updateUploadLimit"]>(`/users/updateUploadLimit/${userId}`, {
      method: "POST",
      data: { uploadLimit: parsedLimit },
    });
    if (!response.success) {
      console.error("Failed to update upload limit", response);
      return showToast({ message: "Failed to update upload limit", type: "error" });
    }

    showToast({ message: "Upload limit updated", type: "success" });
  };

  const onUpdateUserUploadLimit = async (userId: number) => {
    const newLimit = prompt("Enter new upload limit for this user (100MB, 5GB, 1TB, etc..): ");
    if (newLimit === null) return;

    const parsedLimit = convertToFileSize(newLimit);
    if (parsedLimit === null) return showToast({ message: "Invalid file size", type: "error" });

    const response = await fetch<IRequest["/users/updateUploadLimit"]>(`/users/updateUploadLimit`, {
      method: "POST",
      data: { userId, uploadLimit: parsedLimit },
    });
    if (!response.success) {
      console.error("Failed to update upload limit", response);
      return showToast({ message: "Failed to update upload limit", type: "error" });
    }
  };

  const onPurgeUserFiles = async (userId: number) => {
    const confirmed = confirm("Are you sure you want to purge all files for this user?");
    if (!confirmed) {
      return;
    }

    const response = await fetch<IRequest["/files/purgeUserFiles"]>(`/files/purgeUserFiles/${userId}`, {
      method: "DELETE",
    });
    if (!response.success) {
      console.error("Failed to purge files", response);
      return showToast({ message: "Failed to purge files", type: "error" });
    }
  };

  const onDeleteUser = async (userId: number) => {
    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) {
      return;
    }

    const response = await fetch<IRequest["/users/delete"]>(`/users/delete?userId=${userId}`, {
      method: "DELETE",
    });
    if (!response.success) {
      console.error("Failed to delete user", response);
      return showToast({ message: "Failed to delete user", type: "error" });
    }
  };

  const onPageChange = (newPage: number) => {
    page = newPage;
    onChange(false);
  };

  let onChangeTimeout: number | null = null;
  const onChange = async (resetPage = true) => {
    if (onChangeTimeout) {
      clearTimeout(onChangeTimeout);
    }

    onChangeTimeout = setTimeout(async () => {
      if (resetPage) page = 0;
      await fetchUsers();
    }, 500);
  };

  const fetchUsers = async () => {
    // if (user === null) {
    //   return;
    // }

    const url = new URL(`/users/all`, import.meta.env.SHARED_API_URL);
    url.searchParams.append("search", search);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("pageSize", pageSize.toString());

    const response = await fetch<IRequest["/users/all"]>(url.toString());

    if (!response.success) {
      console.error("Failed to fetch files", response);
      return showToast({ message: "Failed to fetch files", type: "error" });
    }

    users = response.data.users;
    totalNumOfUsers = response.data.total;
  };

  onMount(fetchUsers);
</script>

<DashboardPage>
  {#if users}
    <div class="container">
      <div class="filters">
        <div class="input-group">
          <label for="search">Search</label>
          <input type="text" id="search" bind:value={search} on:change={() => onChange()} />
        </div>

        <div class="input-group">
          <label for="pagesize">Page Size</label>
          <select id="pagesize" bind:value={pageSize} on:change={() => onChange()}>
            {#each PAGE_SIZES as size}
              <option value={size} selected={size === pageSize}>{size}</option>
            {/each}
          </select>
        </div>

        {#if totalNumOfUsers > pageSize}
          <Pagination
            label="Page"
            bind:currentPage={page}
            totalPages={Math.max(0, Math.ceil(totalNumOfUsers / pageSize))}
            onChange={onPageChange}
          />
        {/if}
      </div>

      <table class="users">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Uploaded</th>
            <th>Permission</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each users as user}
            <tr class="invite">
              <td class="invite-id">{user.id}</td>
              <td class="invite-code">{user.email}</td>
              <td>
                {user.filesUploaded} ({convertFileSize(user.filesUploadedSize)} / {convertFileSize(user.uploadLimit)})
              </td>
              <td>{user.permission}</td>
              <td style="min-width:150px;">
                <button on:click={() => onUpdateUserUploadLimit(user.id)}>Change upload limit</button>
                <button class="error" on:click={() => onPurgeUserFiles(user.id)}>Purge all files</button>
                <button class="error" on:click={() => onDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</DashboardPage>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;

    .filters {
      display: flex;
      flex-wrap: wrap;

      margin-top: 2em;

      @media (max-width: 768px) {
        justify-content: center;
        align-items: center;
      }

      .input-group {
        margin-right: 10px;

        &.sort-by {
          margin-right: auto;

          @media (max-width: 768px) {
            margin-right: 10px;
          }
        }
      }
    }

    .users {
      width: min(95%, 1100px);
      border-collapse: collapse;
      overflow-x: auto;

      // make scrollbar invisible
      &::-webkit-scrollbar {
        display: none;
      }

      @media (max-width: 768px) {
        display: block;
      }

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
