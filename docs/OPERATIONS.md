# SWAYARI ENTERPRISES — Operations Guide

> **Audience:** SWAYARI Order Management Team & Catalogue Curators  
> **Admin Dashboard URL:** `https://swayari-enterprises.pages.dev/admin/`

---

## 1. Daily Order Request Processing Workflow

Because SWAYARI does not use automated online checkouts, orders are processed manually with personal attention:

```text
[New Request] ➔ [Contacted] ➔ [Quoted] ➔ [Confirmed] ➔ [Dispatched] ➔ [Completed]
                                            ↘ [Cancelled]
```

### Step 1: Monitor Incoming Requests
1. Open the **Admin Control Center** at `/admin/`.
2. Ensure you are signed in with `swayarienterprises@gmail.com`.
3. Check the **New Requests** badge. New inquiries arrive through modest polling (every 30 seconds while the tab is active).

### Step 2: Telephone Consultation
1. Click **Manage** on the order request to open the details drawer.
2. Review the customer's requested items, quantities, and custom notes.
3. Call the customer at their registered telephone number.
4. Discuss and verify:
   - Specific devotional motif, framing finish, and dimensions.
   - Any personalised brass plaque engraving (names, occasion dates, festive dedications).
   - Packaging requirements (standard presentation carton vs velvet keepsake box).
   - Preferred delivery date.
5. In the drawer, log internal notes under **5. Internal Notes** (e.g. *"Spoke with customer; prefers delivery before Oct 24th housewarming"*). Internal notes are completely private to the admin team.
6. Change the order status to **Contacted**.

### Step 3: Issue Formal Quotation Revision
1. In the order drawer under **4. Quotations & Shipping Charges**, enter:
   - Agreed unit price for each requested item (accounting for bulk or festive discounts).
   - Insured shipping charge calculated from destination pincode and package dimensions.
   - Any notes for the customer (e.g. *"Includes custom wooden crate protection and express transit"*).
2. Click **Issue Formal Quotation**.
3. This creates **Quotation Revision #1** and updates the status to **Quoted**.
4. The customer can immediately view this formal breakdown in their account under `/account/orders`.

### Step 4: Confirmation & Payment
1. Once the customer reviews and approves the quotation, agree on the manual payment transfer (NEFT / RTGS / IMPS / UPI to official SWAYARI ENTERPRISES bank account).
2. Upon receipt of payment, change the status to **Confirmed**.

### Step 5: Packaging & Insured Dispatch
1. Hand the reinforced parcel to the courier partner (e.g. Blue Dart, Delhivery).
2. Record the Airway Bill (AWB) number in internal notes.
3. Update the order status to **Dispatched**.
4. Upon delivery confirmation, update status to **Completed**.

---

## 2. Product Photography & Catalogue Management

To maintain optimal web performance and avoid metered cloud storage charges, product photos are deployed as static assets tracked in Git.

### Adding New Products:
1. **Prepare Photos:** Optimize product photography locally (recommended: 1000&times;1000px, JPEG or WebP format, under 250 KB per image).
2. **Save to Repository:** Place image files into `public/assets/products/`.
3. **Regenerate Asset Manifest:**
   ```bash
   node scripts/generate-manifest.js
   ```
4. **Commit & Push to `main`:**
   ```bash
   git add public/assets/
   git commit -m "feat(assets): add photography for new brass uruli collection"
   git push origin main
   ```
5. **Publish in Admin:**
   - Go to `/admin/`, click **Catalogue Products > + Add New Product**.
   - Fill in SKU, title, confirmed material, dimensions, and select the photo from the dropdown gallery.
   - Set status to **Published**.
