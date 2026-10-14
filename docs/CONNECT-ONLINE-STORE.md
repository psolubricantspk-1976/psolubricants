# Activate shared orders and customer chat

## Current status

The code now uses Supabase instead of storing the order/message database in each visitor's browser. **It is not connected to a live project yet.** The “not connected yet” notice is intentional: without a configured online database, the site must not tell customers their orders or messages were received.

Vercel hosts the website. Supabase provides the shared database, authentication, and live update service. A project owner must complete the following account-side steps; no passwords or secret keys need to be shared in chat.

## 1. Create a Supabase project

1. Open https://supabase.com/dashboard and create a project in your own account.
2. Choose an available region suitable for your customers and a plan you are comfortable with. Review pricing and limits before accepting any paid plan.
3. Save the database password in your password manager. **Do not put it in website code or send it in chat.**
4. Wait for the project to finish provisioning.

## 2. Install the database

1. In the Supabase project, open **SQL Editor → New query**.
2. Copy the complete contents of `supabase/migrations/001_shared_store.sql` from this repository.
3. Click **Run**. Run this initial migration once on a new project. It creates the tables, row-level access policies, validated checkout/chat functions, catalog, delivery fees, profile trigger, and Realtime publication membership.
4. If it reports an error, stop and fix that error before continuing. Do not turn off Row Level Security to bypass it.

The migration includes the current four website products and delivery fees. When changing prices, update both the website catalog in `src/data.ts` and the matching Supabase `catalog`/`delivery_zones` rows. The database always calculates the final price; customer-supplied totals are ignored.

## 3. Configure authentication

In **Authentication**:

- Enable the **Email** provider. Keep email confirmation enabled for customer signups.
- Enable **Anonymous Sign-Ins**. This lets visitors place orders or start a chat without registering, while giving each visitor a separate protected database identity. These users still use the authenticated Postgres role; anonymous sign-in does NOT mean public access to records.
- Under URL configuration, set the **Site URL** to `https://psolubricants.vercel.app`.
- Add your exact production URL and any trusted preview URL you will use to the allowed redirect URLs. Do not use an unrestricted wildcard for all Vercel sites.
- Configure production SMTP for reliable customer confirmation emails and review Auth rate limits. Authentication email delivery is separate from order notifications.

### Recommended before public launch: anti-bot protection

The database rate-limits each identity, but that alone does not stop a bot from creating many guest identities.

1. Create a Cloudflare Turnstile widget for your production domain and any trusted preview domains.
2. Put the **Turnstile secret key only in Supabase Authentication's CAPTCHA settings** and enable Turnstile there.
3. Put the **public site key** in Vercel as `VITE_TURNSTILE_SITE_KEY` (next section).
4. Redeploy and test guest checkout, chat, admin login and customer signup. If CAPTCHA is enabled in Supabase but no working site key is configured on the website, those authentication requests will fail.

## 4. Connect Vercel

In the Supabase project settings/Connect dialog, find the **Project URL** and **publishable API key**. The publishable key is meant for browsers; Row Level Security and authenticated sessions protect the data. A legacy `anon` key can also be used if your project only offers legacy keys.

In **Vercel → your `psolubricants` project → Settings → Environment Variables**, add:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Your actual Supabase project URL, e.g. `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The project's publishable key (or legacy `anon` key) |
| `VITE_TURNSTILE_SITE_KEY` | Public Turnstile site key, if CAPTCHA is enabled |

Select **Production** and **Preview** if both deployments should connect to this database. A separate Supabase project for preview/test data is preferable for long-term use.

**Never use a `service_role` key, `sb_secret_...` key, database password, or admin password in a `VITE_` variable. Vite embeds those variables in the public website.**

The updated code must also be deployed:

- All work is on `arena/f1b9d72e-psolubricants`.
- Push/review this branch and merge its pull request into the production branch when ready.
- Trigger a fresh Vercel deployment after saving environment variables. Existing built pages do not pick up new Vite settings until rebuilt.
- Verify the deployment succeeded and that you are opening its correct production/preview URL.

### Arena/local preview is separate

Vercel settings do not automatically configure Arena's live preview. To configure local development, copy `.env.example` to `.env.local`, fill in the same public project URL/key (and site key if used), and restart the Vite server. `.env.local` is ignored by Git. Allow this preview hostname in CAPTCHA/redirect settings if testing authentication here.

## 5. Create your company admin account

1. In **Supabase → Authentication → Users**, add a user with your company email and a **new, strong password**. Confirm that account using Supabase's user-management tools or the email confirmation flow.
2. The old site embedded its admin password in downloadable code. Treat that password as exposed. Do not reuse it; change it anywhere else it was reused.
3. In SQL Editor, replace the email below with the exact email of your admin user and run:

```sql
insert into public.admin_users (user_id)
select id from auth.users
where lower(email) = lower('YOUR_ADMIN_EMAIL')
on conflict do nothing;
```

4. Confirm that exactly the intended account was granted access:

```sql
select u.email
from public.admin_users a
join auth.users u on u.id = a.user_id;
```

5. Open the website's company dashboard and sign in using that account. If you were already signed in before assigning the role, sign out and back in.

Admin permission comes from this database allowlist—not an email check, browser flag, customer profile, or user-editable metadata. Do not give customers admin membership.

## 6. Test using two separate devices

Keep the dashboard open and signed in on your own device. Use another phone or a separate private browser window as the customer.

1. Place a **Cash on Delivery test order**. Do not send a real payment just to test. Wait for “Order placed” and its server-generated codes.
2. Check your admin dashboard. The order should appear automatically. Realtime updates normally arrive promptly; a 15-second catch-up poll also runs while the page is visible.
3. Change the order status in the dashboard. On the customer's device, track it with the full code and the same phone number used at checkout. Check every line if the cart has multiple products.
4. Start a support conversation from the customer device. Check **Customer messages** on your admin device.
5. Reply inside the dashboard. The reply should appear in the customer's website chat.
6. Refresh both devices and confirm that the saved order, messages and status remain.
7. Use a third customer session to verify that other customers' orders, private addresses and conversations are not visible.
8. Turn off the customer's network and try submitting. It must show an error, not claim success. Reconnect and retry; requests reuse retry IDs to avoid duplicates after uncertain network results.
9. Confirm that admin sign-out removes access to other customers' data.

These real deployment checks are still required. Local tests exercise the SQL permissions and business rules in embedded PostgreSQL; they do not test your actual Supabase configuration, SMTP, WebSocket service, CAPTCHA, or Vercel environment.

## How receiving messages works

- New orders and conversations persist in the cloud even when your dashboard is closed.
- While your dashboard is open, it refreshes automatically; when reopened it loads saved data.
- This does **not** send SMS, WhatsApp messages, email alerts, or phone push notifications while the website is closed. Those require a separate notification integration.
- Registered customers can sign in on another device to access their own conversations. Guest conversations belong to their guest session. Clearing browser data, signing out, switching accounts or using a new device does not restore that guest chat automatically. Order tracking works on another device with the full code and checkout phone number.
- A network connection and availability of Supabase/Vercel are required. No website can guarantee availability on every device, blocked network or location.

## Existing browser-only data

Old orders/messages remain in the browsers where they were created; they were never sent to a central server. This update does not pretend they were delivered and does not automatically import them as live orders. Preserve/export any old business records from their original devices before clearing browser data. Plan a verified import separately if needed.

The demo's old customer-account/password storage is removed rather than uploaded. Customers must register real accounts or use guest checkout. Passwords are now handled by Supabase Auth and are never displayed to the company admin.

## Troubleshooting

- **“Not connected yet”**: URL/key missing or invalid at build time, old deployment still open, or Arena preview not configured separately. Save the two variables and rebuild/restart.
- **Anonymous sign-ins disabled**: enable Anonymous Sign-Ins in Supabase Auth.
- **Schema cache / service needs configuration**: migration was not run successfully, wrong project selected, or function/table unavailable. Check the SQL Editor result and project URL.
- **Admin access denied**: verify the account exists in `admin_users`; sign out and in again.
- **No live updates**: confirm `orders`, `conversations`, `chat_entries`, and `customer_profiles` are in the `supabase_realtime` publication; inspect network errors. The visible-page 15-second catch-up should still work if WebSockets are blocked.
- **Emails not arriving**: configure SMTP, review Auth logs and spam folder. Do not disable security policies to fix email delivery.
- **CAPTCHA failure**: verify site key, secret, allowed hostnames and Supabase CAPTCHA configuration match.

## Developer validation

```sh
npm ci
npm test
npm run typecheck
npm run build
```

The tests cover role-based reads, private-data isolation, admin writes, server-calculated checkout totals, transaction rollback, idempotent retries, tracking privacy, customer/admin chat, archived conversations and per-user checkout limits.
