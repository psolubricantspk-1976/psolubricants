import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCloudConfig } from "../scripts/validate-cloud-config";
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
