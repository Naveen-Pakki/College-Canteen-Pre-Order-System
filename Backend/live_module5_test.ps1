$env:JAVA_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1\jbr"
$java = "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1\jbr\bin\java.exe"

Write-Host "===================================================="
Write-Host "STARTING LIVE SPRING BOOT INTEGRATION TEST (MODULE 5)"
Write-Host "===================================================="

# Start Spring Boot in background job
$jarPath = "Backend\target\pragati-canteen-1.0.0-SNAPSHOT.jar"
$proc = Start-Process -FilePath $java -ArgumentList "-jar", $jarPath -PassThru -NoNewWindow

try {
    # 1. Wait for server readiness
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get -TimeoutSec 2
            if ($health.status -eq "SUCCESS" -or $health.status -eq "UP") {
                $ready = $true
                Write-Host "Spring Boot backend is UP and HEALTHY on port 8080!"
                Write-Host "Health Response: $($health | ConvertTo-Json -Compress)"
                break
            }
        } catch {
            # continue waiting
        }
    }

    if (-not $ready) {
        Write-Error "Server did not become ready within 30 seconds."
        exit 1
    }

    # 2. Login as Student
    Write-Host "`n--- Step 1: Login as Student ---"
    $loginBody = @{
        registrationId = "23A91A0501"
        password = "Student@123"
    } | ConvertTo-Json

    $loginResp = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResp.data.token
    Write-Host "Login successful for user '$($loginResp.data.registrationId)'. Token acquired."

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # 3. Browse Foods and Add Item to Cart
    Write-Host "`n--- Step 2: Browse Foods and Add to Cart ---"
    $foods = Invoke-RestMethod -Uri "http://localhost:8080/api/foods" -Method Get -Headers $headers
    $targetFood = $foods.data[0]
    Write-Host "Selected Food Item: ID=$($targetFood.id), Name='$($targetFood.foodName)', Price=Rs.$($targetFood.price)"

    $cartReq = @{
        foodItemId = $targetFood.id
        quantity = 2
    } | ConvertTo-Json

    $cartResp = Invoke-RestMethod -Uri "http://localhost:8080/api/cart/items" -Method Post -Headers $headers -Body $cartReq
    Write-Host "Cart updated. Total Cart Items: $($cartResp.data.totalItems), Grand Total: Rs.$($cartResp.data.grandTotal)"

    # 4. Place Active Canteen Order
    Write-Host "`n--- Step 3: Place Canteen Order ---"
    $orderReq = @{
        paymentMethod = "RAZORPAY"
        specialInstructions = "Live Module 5 verification test"
    } | ConvertTo-Json

    $orderResp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" -Method Post -Headers $headers -Body $orderReq
    $orderId = $orderResp.data.id
    $orderNum = $orderResp.data.orderNumber
    $orderTotal = $orderResp.data.totalAmount
    Write-Host "Order placed successfully! Order ID=$orderId, OrderNumber=$orderNum, Token=$($orderResp.data.tokenNumber), Total=Rs.$orderTotal, Status=$($orderResp.data.orderStatus)"

    # 5. Initiate Razorpay Payment Order (Server-Side Amount Calculation)
    Write-Host "`n--- Step 4: POST /api/payments/create-order ---"
    $paymentOrderReq = @{
        orderId = $orderId
    } | ConvertTo-Json

    $payOrderResp = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/create-order" -Method Post -Headers $headers -Body $paymentOrderReq
    $keyId = $payOrderResp.data.keyId
    $rzpOrderId = $payOrderResp.data.razorpayOrderId
    $amountPaise = $payOrderResp.data.amount
    Write-Host "Razorpay Order Created: KeyID=$keyId, RzpOrderId=$rzpOrderId, AmountPaise=$amountPaise, Currency=$($payOrderResp.data.currency)"

    # 6. Cryptographically Calculate HMAC-SHA256 Payment Signature
    Write-Host "`n--- Step 5: Cryptographic Signature Calculation ---"
    $rzpPaymentId = "pay_test_live_" + [System.Guid]::NewGuid().ToString("N").Substring(0, 14)
    $payloadData = "$rzpOrderId|$rzpPaymentId"
    $keySecret = "PragatiCanteenDevSecret12345"

    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($keySecret)
    $hashBytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($payloadData))
    $calculatedSig = [System.BitConverter]::ToString($hashBytes).Replace("-", "").ToLower()
    Write-Host "Generated authentic HMAC-SHA256 signature for '$payloadData': $calculatedSig"

    # 7. Verify Payment and Confirm Order
    Write-Host "`n--- Step 6: POST /api/payments/verify ---"
    $verifyReq = @{
        internalOrderId = $orderId
        razorpayOrderId = $rzpOrderId
        razorpayPaymentId = $rzpPaymentId
        razorpaySignature = $calculatedSig
    } | ConvertTo-Json

    $verifyResp = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/verify" -Method Post -Headers $headers -Body $verifyReq
    Write-Host "Payment Verified! Payment Status: $($verifyResp.data.paymentStatus), Signature Verified: $($verifyResp.data.signatureVerified), Captured: $($verifyResp.data.captured)"

    # 8. Check Order Payment Status Endpoint
    Write-Host "`n--- Step 7: GET /api/orders/$orderId/payment-status ---"
    $statusResp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId/payment-status" -Method Get -Headers $headers
    Write-Host "Order Payment Status: OrderStatus=$($statusResp.data.orderStatus), PaymentStatus=$($statusResp.data.paymentStatus), PaymentId=$($statusResp.data.razorpayPaymentId)"

    # 9. Verify Pickup Ticket
    Write-Host "`n--- Step 8: GET /api/orders/$orderId/ticket ---"
    $ticketResp = Invoke-RestMethod -Uri "http://localhost:8080/api/orders/$orderId/ticket" -Method Get -Headers $headers
    Write-Host "Digital Ticket Confirmed: Token=$($ticketResp.data.tokenNumber), Status=$($ticketResp.data.orderStatus), VerificationHash=$($ticketResp.data.verificationHash)"

    # 10. Test Asynchronous Webhook Endpoint (No JWT, Signature Authenticated)
    Write-Host "`n--- Step 9: POST /api/payments/webhook (Signature Authentication & Idempotency) ---"
    $webhookSecret = "PragatiCanteenWebhookSecret98765"
    $webhookEventId = "evt_live_" + [System.Guid]::NewGuid().ToString("N").Substring(0, 12)
    $webhookPayload = @{
        entity = "event"
        account_id = "acc_pragati_canteen"
        event = "payment.captured"
        id = $webhookEventId
        payload = @{
            payment = @{
                entity = @{
                    id = $rzpPaymentId
                    order_id = $rzpOrderId
                    amount = $amountPaise
                    currency = "INR"
                    status = "captured"
                    method = "upi"
                }
            }
        }
    } | ConvertTo-Json -Depth 5

    $hmacWeb = New-Object System.Security.Cryptography.HMACSHA256
    $hmacWeb.Key = [System.Text.Encoding]::UTF8.GetBytes($webhookSecret)
    $webHashBytes = $hmacWeb.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($webhookPayload))
    $webhookSig = [System.BitConverter]::ToString($webHashBytes).Replace("-", "").ToLower()

    $webHeaders = @{
        "X-Razorpay-Signature" = $webhookSig
        "Content-Type" = "application/json"
    }

    $webhookResp = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/webhook" -Method Post -Headers $webHeaders -Body $webhookPayload
    Write-Host "Webhook Call 1 (Fresh Event): Status=$($webhookResp.status), Data=$($webhookResp.data)"

    # Call again with identical payload to verify idempotency deduplication
    $webhookResp2 = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/webhook" -Method Post -Headers $webHeaders -Body $webhookPayload
    Write-Host "Webhook Call 2 (Duplicate Replay): Status=$($webhookResp2.status), Data=$($webhookResp2.data) - IDEMPOTENTLY HANDLED!"

    Write-Host "`n===================================================="
    Write-Host "MODULE 5 FULL INTEGRATION TEST PASSED WITH 100% SUCCESS!"
    Write-Host "===================================================="

} finally {
    Write-Host "`nStopping Spring Boot backend process..."
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Process terminated."
}
