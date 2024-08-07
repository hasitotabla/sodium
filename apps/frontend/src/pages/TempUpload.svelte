<script lang="ts">
  import Upload from "$components/Upload.svelte";
  import { navigate } from "svelte-routing";

  const query = new URLSearchParams(window.location.search);
  const sessionToken = query.get("session");
</script>

<Upload withSessionToken={sessionToken} onFileUploaded={(url) => navigate(url)} />
