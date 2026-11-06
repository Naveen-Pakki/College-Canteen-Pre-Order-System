package com.pragati.canteen.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pragati.canteen.dto.*;
import com.pragati.canteen.enums.OrderStatus;
import com.pragati.canteen.enums.PaymentStatus;
import com.pragati.canteen.exception.GlobalExceptionHandler;
import com.pragati.canteen.exception.InvalidOperationException;
import com.pragati.canteen.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Module 4 - OrderController and AdminOrderController REST Tests")
class OrderControllerTest {

    private MockMvc customerMockMvc;
    private MockMvc adminMockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    // Stub service to avoid bytecode agent issues in sandboxed Java 21 environments
    private static class StubOrderService extends OrderService {
        public StubOrderService() {
            super(null, null, null, null, null, null, null);
        }

        @Override
        public OrderDto placeOrder(OrderPlacementRequest request) {
            if ("FAIL_KEY".equals(request.getIdempotencyKey())) {
                throw new InvalidOperationException("Cannot place order: Your cart is empty.");
            }
            return OrderDto.builder()
                    .id(1L)
                    .orderNumber("PU-2026-001042")
                    .tokenNumber("TKT-42")
                    .userId(10L)
                    .userName("Sai Vardhan")
                    .userRegistrationId("23A91A0501")
                    .userRole("STUDENT")
                    .orderDate(LocalDateTime.now())
                    .formattedDate("Today, 31 Oct")
                    .orderStatus(OrderStatus.PENDING_PAYMENT)
                    .paymentStatus(PaymentStatus.PENDING)
                    .paymentMethod("Razorpay (Direct Online)")
                    .subtotal(new BigDecimal("90.00"))
                    .tax(new BigDecimal("4.50"))
                    .totalAmount(new BigDecimal("94.50"))
                    .stockReserved(true)
                    .items(List.of(
                            OrderItemDto.builder()
                                    .id(101L)
                                    .foodItemId(1L)
                                    .foodName("Idli (3 pcs)")
                                    .categoryName("Breakfast")
                                    .unitPrice(new BigDecimal("40.00"))
                                    .quantity(2)
                                    .itemSubtotal(new BigDecimal("80.00"))
                                    .build()
                    ))
                    .build();
        }

        @Override
        public Page<OrderDto> getUserOrders(Pageable pageable) {
            OrderDto o = placeOrder(new OrderPlacementRequest());
            Pageable req = (pageable != null && pageable.isPaged()) ? pageable : org.springframework.data.domain.PageRequest.of(0, 10);
            return new PageImpl<>(List.of(o), req, 1);
        }

        @Override
        public OrderDto getOrderById(Long orderId) {
            return placeOrder(new OrderPlacementRequest());
        }

        @Override
        public OrderTicketDto getOrderTicket(Long orderId) {
            return OrderTicketDto.builder()
                    .id(orderId)
                    .orderNumber("PU-2026-001042")
                    .tokenNumber("TKT-42")
                    .userName("Sai Vardhan")
                    .userRegistrationId("23A91A0501")
                    .userRole("STUDENT")
                    .date("Today")
                    .orderDate("Today")
                    .status("PENDING_PAYMENT")
                    .orderStatus(OrderStatus.PENDING_PAYMENT)
                    .paymentStatus(PaymentStatus.PENDING)
                    .totalAmount(new BigDecimal("94.50"))
                    .verificationHash("A1B2C3D4E5F67890")
                    .build();
        }

        @Override
        public OrderDto cancelOrder(Long orderId, String reason) {
            OrderDto o = placeOrder(new OrderPlacementRequest());
            o.setOrderStatus(OrderStatus.CANCELLED);
            o.setCancellationReason(reason != null ? reason : "Cancelled by user");
            o.setStockReserved(false);
            return o;
        }

        @Override
        public Page<OrderDto> getAllOrdersAdmin(OrderStatus status, String search, Pageable pageable) {
            OrderDto o = placeOrder(new OrderPlacementRequest());
            Pageable req = (pageable != null && pageable.isPaged()) ? pageable : org.springframework.data.domain.PageRequest.of(0, 10);
            return new PageImpl<>(List.of(o), req, 1);
        }

        @Override
        public OrderDto updateOrderStatusByAdmin(Long orderId, OrderStatusUpdateRequest request) {
            OrderDto o = placeOrder(new OrderPlacementRequest());
            o.setOrderStatus(request.getOrderStatus());
            o.setAdminNote(request.getAdminNote());
            return o;
        }

        @Override
        public int expireUnpaidOrders() {
            return 3;
        }
    }

    @BeforeEach
    void setUp() {
        StubOrderService stubService = new StubOrderService();
        OrderController customerController = new OrderController(stubService);
        AdminOrderController adminController = new AdminOrderController(stubService);

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter(mapper);

        customerMockMvc = MockMvcBuilders.standaloneSetup(customerController)
                .setMessageConverters(converter)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        adminMockMvc = MockMvcBuilders.standaloneSetup(adminController)
                .setMessageConverters(converter)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // =========================================================================
    // Customer Endpoint Tests (/api/orders)
    // =========================================================================

    @Test
    @DisplayName("POST /api/orders places order and returns 201 Created")
    void testPlaceOrder_Endpoint() throws Exception {
        OrderPlacementRequest req = OrderPlacementRequest.builder()
                .paymentMethod("Razorpay (Direct Online)")
                .specialInstructions("Extra spoons")
                .build();

        customerMockMvc.perform(post("/api/orders")
                        .header("X-Idempotency-Key", "token-9988")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.orderNumber").value("PU-2026-001042"))
                .andExpect(jsonPath("$.data.tokenNumber").value("TKT-42"))
                .andExpect(jsonPath("$.data.totalAmount").value(94.50));
    }

    @Test
    @DisplayName("GET /api/orders returns paginated user orders")
    void testGetMyOrders_Endpoint() throws Exception {
        customerMockMvc.perform(get("/api/orders?page=0&size=10"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.content[0].orderNumber").value("PU-2026-001042"));
    }

    @Test
    @DisplayName("GET /api/orders/{id} returns single order detail")
    void testGetOrderById_Endpoint() throws Exception {
        customerMockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.userName").value("Sai Vardhan"));
    }

    @Test
    @DisplayName("GET /api/orders/{id}/ticket returns digital order ticket")
    void testGetOrderTicket_Endpoint() throws Exception {
        customerMockMvc.perform(get("/api/orders/1/ticket"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.tokenNumber").value("TKT-42"))
                .andExpect(jsonPath("$.data.verificationHash").value("A1B2C3D4E5F67890"));
    }

    @Test
    @DisplayName("POST /api/orders/{id}/cancel cancels order successfully")
    void testCancelOrder_Endpoint() throws Exception {
        customerMockMvc.perform(post("/api/orders/1/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "Changed item"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.orderStatus").value("CANCELLED"));
    }

    // =========================================================================
    // Admin Endpoint Tests (/api/admin/orders)
    // =========================================================================

    @Test
    @DisplayName("GET /api/admin/orders returns campus orders page")
    void testAdminGetAllOrders_Endpoint() throws Exception {
        adminMockMvc.perform(get("/api/admin/orders?page=0&size=15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.content[0].orderNumber").value("PU-2026-001042"));
    }

    @Test
    @DisplayName("PATCH /api/admin/orders/{id}/status updates order lifecycle stage")
    void testAdminUpdateOrderStatus_Endpoint() throws Exception {
        OrderStatusUpdateRequest req = OrderStatusUpdateRequest.builder()
                .orderStatus(OrderStatus.PREPARING)
                .adminNote("Chef is preparing")
                .build();

        adminMockMvc.perform(patch("/api/admin/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.orderStatus").value("PREPARING"));
    }

    @Test
    @DisplayName("POST /api/admin/orders/expire-unpaid runs sweep on expired orders")
    void testAdminExpireUnpaid_Endpoint() throws Exception {
        adminMockMvc.perform(post("/api/admin/orders/expire-unpaid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.expiredCount").value(3));
    }
}

