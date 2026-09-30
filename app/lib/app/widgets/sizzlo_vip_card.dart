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
        gradient: AppColors.royalCardGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryDark.withOpacity(0.35),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: AppColors.gold.withOpacity(0.15),
            blurRadius: 30,
            offset: const Offset(0, -2),
          ),
        ],
        border: Border.all(color: AppColors.gold.withOpacity(0.3), width: 1.2),
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
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.restaurant_menu, color: AppColors.gold, size: 20),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'SIZZLO',
                        style: AppTextStyles.titleMedium.copyWith(
                          color: Colors.white,
                          letterSpacing: 3.0,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'EXCLUSIVE MEMBERSHIP',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.gold,
                      fontSize: 10,
                      letterSpacing: 2.2,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.gold.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.gold.withOpacity(0.4)),
                ),
                child: Text(
                  widget.member.membershipType,
                  style: AppTextStyles.badge.copyWith(color: AppColors.gold, fontSize: 10),
                ),
              ),
            ],
          ),

          SizedBox(height: widget.compact ? 24 : 32),

          // Member Name & ID
          Text(
            'MEMBER',
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
            style: AppTextStyles.cardTitle.copyWith(fontSize: widget.compact ? 22 : 26),
          ),
          const SizedBox(height: 4),
          Text(
            'ID · ${widget.member.membershipId}',
            style: TextStyle(
              fontSize: 12,
              letterSpacing: 1.2,
              color: Colors.white.withOpacity(0.8),
              fontWeight: FontWeight.w500,
            ),
          ),

          SizedBox(height: widget.compact ? 20 : 28),

          // Footer: Expiry & QR Code
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
                  const SizedBox(height: 3),
                  Text(
                    widget.member.expiryDate,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  if (!widget.compact) ...[
                    const SizedBox(height: 10),
                    Text(
                      'Tap to flip & view barcode',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.gold.withOpacity(0.9),
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ],
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.gold.withOpacity(0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: QrImageView(
                  data: widget.member.membershipId,
                  version: QrVersions.auto,
                  size: widget.compact ? 48.0 : 64.0,
                  eyeStyle: const QrEyeStyle(
                    eyeShape: QrEyeShape.square,
                    color: AppColors.primary,
                  ),
                  dataModuleStyle: const QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: AppColors.primary,
                  ),
                ),
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
