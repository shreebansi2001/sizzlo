import 'dart:math';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_text_styles.dart';
import '../data/models/member_model.dart';

class SizzloVipCard extends StatefulWidget {
  final MemberModel member;
  final bool compact;
  final bool enableFlip;

  const SizzloVipCard({
    Key? key,
    required this.member,
    this.compact = false,
    this.enableFlip = true,
  }) : super(key: key);

  @override
  State<SizzloVipCard> createState() => _SizzloVipCardState();
}

class _SizzloVipCardState extends State<SizzloVipCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _showFront = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutBack),
    );
  }

  void _flipCard() {
    if (!widget.enableFlip) return;
    if (_showFront) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    setState(() {
      _showFront = !_showFront;
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _flipCard,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final angle = _animation.value * pi;
          final isBack = angle >= pi / 2;

          return Transform(
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001) // perspective
              ..rotateY(angle),
            alignment: Alignment.center,
            child: isBack
                ? Transform(
                    transform: Matrix4.identity()..rotateY(pi),
                    alignment: Alignment.center,
                    child: _buildBackCard(),
                  )
                : _buildFrontCard(),
          );
        },
      ),
    );
  }

  Widget _buildFrontCard() {
    return Container(
      decoration: BoxDecoration(
        gradient: widget.member.cardGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: AppColors.gold.withOpacity(0.12),
            blurRadius: 25,
            offset: const Offset(0, -2),
          ),
        ],
        border: Border.all(color: widget.member.planAccentColor.withOpacity(0.4), width: 1.2),
      ),
      padding: EdgeInsets.all(widget.compact ? 20 : 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Top Header: Logo & VIP Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.asset(
                    'assets/images/yanki-logo.png',
                    height: 22,
                    fit: BoxFit.contain,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.member.planTitle,
                    style: const TextStyle(
                      color: AppColors.gold,
                      fontSize: 9,
                      letterSpacing: 1.4,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.gold.withOpacity(0.4)),
                  ),
                  child: Text(
                    widget.member.planMemberLabel,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.badge.copyWith(
                      color: AppColors.gold,
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
              ),
            ],
          ),

          SizedBox(height: widget.compact ? 22 : 30),

          // Member Name & ID
          Text(
            'SUBSCRIBER',
            style: TextStyle(
              fontSize: 10,
              letterSpacing: 2.0,
              fontWeight: FontWeight.w600,
              color: Colors.white.withOpacity(0.6),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            widget.member.fullName,
            style: AppTextStyles.cardTitle.copyWith(
              fontSize: widget.compact ? 24 : 28,
              fontFamily: 'Playfair Display',
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'ID · ${widget.member.membershipId}',
            style: TextStyle(
              fontSize: 12,
              letterSpacing: 1.2,
              color: Colors.white.withOpacity(0.7),
              fontWeight: FontWeight.w500,
            ),
          ),

          SizedBox(height: widget.compact ? 22 : 28),

          // Footer: Expiry & Subscription Price matching demo_code MembershipCard.tsx
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'VALID THRU',
                    style: TextStyle(
                      fontSize: 10,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w600,
                      color: Colors.white.withOpacity(0.5),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.member.expiryDate,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'SUBSCRIPTION',
                    style: TextStyle(
                      fontSize: 10,
                      letterSpacing: 1.5,
                      fontWeight: FontWeight.w600,
                      color: Colors.white.withOpacity(0.5),
                    ),
                  ),
                  const SizedBox(height: 4),
                  RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: '${widget.member.planPriceFormatted} ',
                          style: const TextStyle(
                            color: AppColors.gold,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Playfair Display',
                          ),
                        ),
                        TextSpan(
                          text: 'annually',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.6),
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBackCard() {
    return Container(
      decoration: BoxDecoration(
        gradient: AppColors.darkCardGradient,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.gold.withOpacity(0.3), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Magnetic Strip Effect
          Container(
            height: 42,
            margin: const EdgeInsets.only(top: 8, bottom: 20),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.85),
              borderRadius: BorderRadius.circular(6),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('MEMBERSHIP PERKS', style: AppTextStyles.badge.copyWith(color: AppColors.gold)),
                  const SizedBox(height: 4),
                  Text('• 50% Dining Privilege\n• Priority Table Booking\n• Complimentary Birthday Cake',
                      style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.8), height: 1.4)),
                ],
              ),
              QrImageView(
                data: 'https://sizzlo.in/verify/${widget.member.membershipId}',
                version: QrVersions.auto,
                size: 54,
                backgroundColor: Colors.white,
              ),
            ],
          ),
          const Spacer(),
          Text(
            'Emergency Concierge: +91 79 4001 0001\nValid across all Yanki Signature & Sizzlo venues',
            style: TextStyle(fontSize: 9, color: Colors.white.withOpacity(0.5), height: 1.3),
          ),
        ],
      ),
    );
  }
}
