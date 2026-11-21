// Loaded before the test runner starts. The suites expect the API without
// signed URLs, so a SIGNING_SECRETS exported in the shell must not reach them.
// The signature tests set the variable themselves for their child processes.
delete process.env.SIGNING_SECRETS;
