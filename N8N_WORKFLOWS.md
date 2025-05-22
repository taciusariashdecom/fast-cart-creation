# N8N Workflow Definitions

This document outlines the specifications for N8N workflows used by the frontend application.

## Product Data Webhook

This webhook is responsible for providing the frontend with the list of available products.

*   **Endpoint URL:** `https://n8n.facilpersianas.com.br/webhook/get-products`
*   **Purpose:** To fetch all available products for display in the quotation tool.
*   **Method:** `GET`
*   **Request Body:** None.
*   **Response Body:**
    A JSON array of product objects. Each object should conform to the following structure:

    ```json
    [
      {
        "title": "Example Product Name",
        "product_ids": ["123456789", "987654321"],
        "minWidth": 10.5,
        "maxWidth": 100.0,
        "minHeight": 20.0,
        "maxHeight": 200.5,
        "type": "Roller Blind",
        "movementControl": "left,right"
      }
      // ... more product objects
    ]
    ```

*   **Field Descriptions:**
    *   `title`: (String) The display name of the product.
    *   `product_ids`: (Array of Strings) Shopify Product IDs, with the `gid://shopify/Product/` prefix removed.
    *   `minWidth`: (Number) The minimum width of the product in centimeters (cm).
    *   `maxWidth`: (Number) The maximum width of the product in centimeters (cm).
    *   `minHeight`: (Number) The minimum height of the product in centimeters (cm).
    *   `maxHeight`: (Number) The maximum height of the product in centimeters (cm).
    *   `type`: (String) The category or type of the product (e.g., "Roller", "Roman", "Panel").
    *   `movementControl`: (String | null) Comma-separated string indicating available movement control options (e.g., "left,right"), or `null` if not applicable or standard.

*   **Important Implementation Notes for N8N Workflow:**
    *   The N8N workflow must fetch product data from the primary data source (e.g., Shopify, database).
    *   **Unit Conversion:** All dimensions (minWidth, maxWidth, minHeight, maxHeight) must be provided in **centimeters (cm)**. If the source data is in millimeters (mm), the workflow must perform the conversion (divide by 10).
    *   **Product ID Formatting:** The `product_ids` array must contain only the numerical Shopify Product IDs. The `gid://shopify/Product/` prefix often found in Shopify API responses must be removed.
    *   The webhook should return a `Content-Type: application/json` header.

## Variant Data Webhook (Existing)

This webhook is used to retrieve detailed variant information for products based on their IDs.

*   **Endpoint URL:** `https://n8n.facilpersianas.com.br/webhook/retrieve-variants-data-on-shopify`
*   **Purpose:** To fetch specific variant details (SKU, price, dimensions, stock) for one or more products. This is typically called when calculating prices for items in the cart.
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "ids": ["shopify_product_id_1", "shopify_product_id_2"]
    }
    ```
*   **Response Body:**
    (The response structure for this webhook is complex and based on the Shopify GraphQL Admin API Product node. It should return an array of product nodes, each containing its variants. Refer to `src/lib/products.ts` function `updatePrices` and `processVariant` for how the frontend currently consumes this.)
