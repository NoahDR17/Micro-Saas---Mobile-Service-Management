
  // Forgot password endpoint
  fastify.post<{ Body: { email: string } }>('/forgot-password', async (request, reply) => {
    try {
      const { email } = request.body;

      if (!email) {
        return reply.status(400).send({
          error: {
            message: 'Email required',
            code: 'MISSING_EMAIL',
          },
        });
      }

      const user = await fastify.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists for security
        return reply.status(200).send({
          message: 'If an account exists with this email, a password reset link has been sent.',
        });
      }

      // Generate reset token
      const resetToken = generateVerificationToken();
      await fastify.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetSentAt: new Date(),
        },
      });

      // In production, send actual email here
      console.log(`🔑 Password reset token for ${email}: ${resetToken}`);

      return reply.status(200).send({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: {
          message: 'Failed to process forgot password request',
          code: 'FORGOT_PASSWORD_ERROR',
        },
      });
    }
  });

  // Reset password endpoint
  fastify.post<{ Body: { token: string; password: string } }>('/reset-password', a        });
      }

      // Generate reset token
      const resetToken = gbody;

      if (!token) {
        return reply.status(400).send({
          error: {
            message: 'Reset token required',
            code: 'MISSING_TOKEN',
          },
        });
      }

      if (!password || password.length < 8) {
        return reply.status(400).send({
          error: {
            message: 'Password must be at least 8 characters',
            code: 'INVALID_PASSWORD',
          },
        });
      }

      const user = await fastify.prisma.user.findFirst({
        where: {
          passwordResetToken: token,
        },
        include: { business: true },
      });

      return reply.status(500)urn reply.status(400).send({
          error: {
            message: 'Invalid or expired reset token',
            code: 'INVALID_TOKEN',
          },
        });
      }

      // Check if token is older than 24 hours
      const tokenAge = Date.now() - (user.passwordResetSentAt?.getTime() || 0);
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return reply.status(400).send({
          error: {
            message: 'Reset token expired. Please request a new one.',
            code: 'EXPIRED_TOKEN',
          },
        });
      }

      // Update password and clear reset token
      const passwordHash = await hashPassword(password);
      const updatedUser = await fastify.prisma.user.update({
        where: { id: user.id },
        data:          },
        });
      }

   passwordResetToken: null,
          passwordResetSentAt: null,
        },
      });

      // Generate JWT token
      const jwtToken = signToken({
        userId: updatedUser.id,
        businessId: updatedUser.businessId,
        role: updatedUser.role,
      });

      // Set cookie
      reply.setCookie(config.cookieName, jwtToken,           },
        });
         secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        user: {
          id: updatedUser.id,
          businessId: updatedUser.businessId,           email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
        business: {
          id: user.business.id,
          name: user.business.name,
          timezone: user.business.timezone,
          identifierLabel: user.business.identifierLabel,
          defaultRebookIntervalDays: user.business        });
      }

   ys,
          defaultChannel: user.business.defaultChannel,
          setupCompleted: user.business.setupCompleted,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return rep        role: updatedUser.role,
      });
       message: 'Failed to reset password',
          code: 'RESET_PASSWORD_ERROR',
        },
      });
    }
  });
