<script lang="ts">
  import DashboardPage from "$components/_partial/DashboardPage.svelte";
  import Upload from "$components/Upload.svelte";
</script>

<DashboardPage>
  <Upload showTempSessionCreate onFileUploaded={(url) => window.open(url, "_blank")} />
</DashboardPage>
