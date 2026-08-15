import { Controller, Post, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('create-checkout-session')
    @ApiOperation({ summary: 'Create Stripe checkout session for course enrollment' })
    async createCheckoutSession(
        @Body() body: { studentId: string; courseId: string },
    ) {
        return this.paymentsService.createCheckoutSession(body.studentId, body.courseId);
    }

    @Post('verify-payment')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify payment and update enrollment' })
    async verifyPayment(@Body() body: { sessionId: string }) {
        return this.paymentsService.handlePaymentSuccess(body.sessionId);
    }

    @Get('session-status')
    @ApiOperation({ summary: 'Get payment session status' })
    async getSessionStatus(@Query('session_id') sessionId: string) {
        return this.paymentsService.verifyPayment(sessionId);
    }
}
