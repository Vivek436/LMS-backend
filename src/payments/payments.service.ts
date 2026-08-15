import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
const Stripe = require('stripe');
import { Enrollment, PaymentStatus } from '../enrollments/entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { Student } from '../students/entities/student.entity';
import { Instructor } from '../instructors/entities/instructor.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
    private readonly stripe;

    constructor(
        @InjectModel(Enrollment.name) private enrollmentModel: Model<Enrollment>,
        @InjectModel(Course.name) private courseModel: Model<Course>,
        @InjectModel(Student.name) private studentModel: Model<Student>,
        @InjectModel(Instructor.name) private instructorModel: Model<Instructor>,
        private notificationsService: NotificationsService,
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    }

    async createCheckoutSession(studentId: string, courseId: string) {
        // Fetch course details
        const course = await this.courseModel.findById(courseId).populate('instructorId');
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Stripe minimum amount validation (50 cents = ₹50)
        if (course.price < 50) {
            throw new BadRequestException('Course price must be at least ₹50 for online payment. Please contact admin for free or low-cost courses.');
        }

        // Fetch student details
        const student = await this.studentModel.findById(studentId);
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Check if already enrolled
        const existingEnrollment = await this.enrollmentModel.findOne({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId),
        });

        if (existingEnrollment && existingEnrollment.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('Already enrolled in this course');
        }

        // Create or update enrollment with pending status
        let enrollment;
        if (existingEnrollment) {
            enrollment = existingEnrollment;
        } else {
            enrollment = await this.enrollmentModel.create({
                studentId: new Types.ObjectId(studentId),
                courseId: new Types.ObjectId(courseId),
                paymentStatus: PaymentStatus.PENDING,
                status: 'active',
            });
        }

        // Create Stripe checkout session
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: course.title,
                            description: course.description,
                        },
                        unit_amount: Math.round(course.price * 100), // Convert to paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/learn/payment/success?session_id={CHECKOUT_SESSION_ID}&enrollment_id=${enrollment._id}`,
            cancel_url: `${process.env.FRONTEND_URL}/learn/browse`,
            customer_email: student.email,
            metadata: {
                enrollmentId: enrollment._id.toString(),
                studentId: studentId,
                courseId: courseId,
            },
        });

        return {
            sessionId: session.id,
            url: session.url,
            enrollmentId: enrollment._id,
        };
    }

    async handlePaymentSuccess(sessionId: string) {
        // Retrieve session from Stripe
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            throw new BadRequestException('Payment not completed');
        }

        const enrollmentId = session.metadata.enrollmentId;
        const enrollment = await this.enrollmentModel
            .findById(enrollmentId)
            .populate('courseId')
            .populate('studentId');

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        // Update enrollment with payment details
     

        enrollment.paymentStatus = PaymentStatus.PAID;
        enrollment.amountPaid = session.amount_total / 100; // Convert from paise to rupees
        enrollment.paymentDate = new Date();
        enrollment.paymentReference = session.payment_intent as string;
        await enrollment.save();

     

        // Update course enrollment count
        await this.courseModel.findByIdAndUpdate(enrollment.courseId, {
            $inc: { enrollmentCount: 1 },
        });

        // Get course and instructor details for notification
        const course: any = enrollment.courseId;
        const student: any = enrollment.studentId;
        const instructor = await this.instructorModel.findById(course.instructorId);

        // Send notifications to admin and instructor
        await this.notificationsService.sendPaymentSuccessNotification({
            student: {
                name: `${student.firstName} ${student.lastName}`,
                email: student.email,
            },
            course: {
                title: course.title,
                price: enrollment.amountPaid,
            },
            instructor: instructor ? {
                name: `${instructor.firstName} ${instructor.lastName}`,
                email: instructor.email,
            } : null,
            paymentDate: enrollment.paymentDate,
            paymentReference: enrollment.paymentReference,
        });

        return {
            enrollment,
            notification: {
                student: {
                    name: `${student.firstName} ${student.lastName}`,
                    email: student.email,
                },
                course: {
                    title: course.title,
                    price: enrollment.amountPaid,
                },
                instructor: instructor ? {
                    name: `${instructor.firstName} ${instructor.lastName}`,
                    email: instructor.email,
                } : null,
                paymentDate: enrollment.paymentDate,
                paymentReference: enrollment.paymentReference,
            },
        };
    }

    async verifyPayment(sessionId: string) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            return {
                status: session.payment_status,
                amountTotal: session.amount_total / 100,
                customerEmail: session.customer_email,
            };
        } catch (error) {
            throw new BadRequestException('Invalid session ID');
        }
    }
}
