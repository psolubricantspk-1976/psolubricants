import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveCloudConfig, validateCloudConfig } from "../scripts/validate-cloud-config";
const url = "https://example.supabase.co";
const config = (key: string) => ({ VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: key });
const jwt = (role: string) => `header.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;

test("unconfigured preview can build with an honest setup notice", () => {
  assert.doesNotThrow(() => validateCloudConfig({}));
});
test("public publishable and legacy anon keys are accepted", () => {
  assert.doesNotThrow(() => validateCloudConfig(config("sb_publishable_test_only")));
  assert.doesNotThrow(() => validateCloudConfig(config(jwt("anon"))));
});
test("secret and service-role keys are rejected before bundling", () => {
  assert.throws(() => validateCloudConfig(config("sb_secret_test_only")), /Never place/);
  assert.throws(() => validateCloudConfig(config(jwt("service_role"))), /not a service-role/);
  assert.throws(() => validateCloudConfig(config("invalid")), /Use a Supabase publishable key/);
});
test("partial configuration and non-HTTPS URLs are rejected", () => {
  assert.throws(() => validateCloudConfig({ VITE_SUPABASE_URL: url }), /Set both/);
  assert.throws(() => validateCloudConfig({ ...config("sb_publishable_test_only"), VITE_SUPABASE_URL: "http://example.test" }), /HTTPS/);
});
test("Supabase's own website and the example placeholder are rejected as project URLs", () => {
  for (const wrongUrl of [
    "https://supabase.co", "https://www.supabase.co", "https://SUPABASE.CO/",
    "https://supabase.com", "https://supabase.com/dashboard/project/abcdefghijklmnopqrst",
    "https://app.supabase.com/project/abcdefghijklmnopqrst", "https://YOUR_PROJECT_REF.supabase.co",
  ]) {
    assert.throws(() => validateCloudConfig({ ...config("sb_publishable_test_only"), VITE_SUPABASE_URL: wrongUrl }), /not Supabase's website/, wrongUrl);
  }
  // Also caught when supplied through the Vercel/Next.js-style alias names.
  assert.throws(() => resolveCloudConfig({
    NEXT_PUBLIC_SUPABASE_URL: "https://supabase.co", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_only",
  }), /not Supabase's website/);
});
test("real project URLs and custom domains are still accepted", () => {
  for (const projectUrl of ["https://abcdefghijklmnopqrst.supabase.co", "https://abcdefghijklmnopqrst.supabase.co/", "https://api.example.com"]) {
    assert.doesNotThrow(() => validateCloudConfig({ ...config("sb_publishable_test_only"), VITE_SUPABASE_URL: projectUrl }), projectUrl);
  }
});

test("Vercel public integration aliases map to the Vite client configuration", () => {
  for (const [urlName, keyName] of [
    ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
    ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"],
    ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
  ]) {
    assert.deepEqual(resolveCloudConfig({ [urlName]: url, [keyName]: "sb_publishable_test_only" }), {
      url, key: "sb_publishable_test_only",
    });
  }
});
test("explicit Vite configuration takes precedence over integration aliases", () => {
  assert.deepEqual(resolveCloudConfig({
    ...config("sb_publishable_explicit"),
    NEXT_PUBLIC_SUPABASE_URL: "https://other.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt("anon"),
  }), { url, key: "sb_publishable_explicit" });
});
test("integration mapping never selects database or privileged credentials", () => {
  assert.deepEqual(resolveCloudConfig({
    SUPABASE_SERVICE_ROLE_KEY: "sb_secret_do_not_expose",
    SUPABASE_SECRET_KEY: "sb_secret_do_not_expose",
    POSTGRES_PASSWORD: "not-a-public-value",
    SUPABASE_JWT_SECRET: "not-a-public-value",
  }), { url: "", key: "" });
  assert.throws(() => resolveCloudConfig({
    SUPABASE_URL: url, SUPABASE_ANON_KEY: jwt("service_role"),
  }), /not a service-role/);
});
