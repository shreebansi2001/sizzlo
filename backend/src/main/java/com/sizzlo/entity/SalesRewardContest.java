package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_reward_contests")
public class SalesRewardContest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contest_title")
    private String contestTitle;

    @Column(length = 1000)
    private String description;

    private String channel;

    @Column(name = "prize_reward")
    private String prizeReward;

    @Column(name = "target_criteria")
    private String targetCriteria;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private String status;

    @Column(name = "winner_staff_id")
    private String winnerStaffId;

    @Column(name = "winner_staff_name")
    private String winnerStaffName;

    @Column(name = "winner_prize_awarded")
    private Boolean winnerPrizeAwarded = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public SalesRewardContest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContestTitle() { return contestTitle; }
    public void setContestTitle(String contestTitle) { this.contestTitle = contestTitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getPrizeReward() { return prizeReward; }
    public void setPrizeReward(String prizeReward) { this.prizeReward = prizeReward; }

    public String getTargetCriteria() { return targetCriteria; }
    public void setTargetCriteria(String targetCriteria) { this.targetCriteria = targetCriteria; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getWinnerStaffId() { return winnerStaffId; }
    public void setWinnerStaffId(String winnerStaffId) { this.winnerStaffId = winnerStaffId; }

    public String getWinnerStaffName() { return winnerStaffName; }
    public void setWinnerStaffName(String winnerStaffName) { this.winnerStaffName = winnerStaffName; }

    public Boolean getWinnerPrizeAwarded() { return winnerPrizeAwarded; }
    public void setWinnerPrizeAwarded(Boolean winnerPrizeAwarded) { this.winnerPrizeAwarded = winnerPrizeAwarded; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
