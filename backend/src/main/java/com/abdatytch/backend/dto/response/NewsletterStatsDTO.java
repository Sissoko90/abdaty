package com.abdatytch.backend.dto.response;

/**
 * Statistiques globales de la newsletter (tableau de bord admin).
 */
public class NewsletterStatsDTO {

    private Long totalSubscribers;
    private Long activeSubscribers;
    private Long unsubscribed;
    private Long totalCampaigns;
    private Long emailsSent;
    private Long totalOpens;
    private Long totalClicks;

    public Long getTotalSubscribers() {return totalSubscribers;}

    public void setTotalSubscribers(Long totalSubscribers) {this.totalSubscribers = totalSubscribers;}

    public Long getActiveSubscribers() {return activeSubscribers;}

    public void setActiveSubscribers(Long activeSubscribers) {this.activeSubscribers = activeSubscribers;}

    public Long getUnsubscribed() {return unsubscribed;}

    public void setUnsubscribed(Long unsubscribed) {this.unsubscribed = unsubscribed;}

    public Long getTotalCampaigns() {return totalCampaigns;}

    public void setTotalCampaigns(Long totalCampaigns) {this.totalCampaigns = totalCampaigns;}

    public Long getEmailsSent() {return emailsSent;}

    public void setEmailsSent(Long emailsSent) {this.emailsSent = emailsSent;}

    public Long getTotalOpens() {return totalOpens;}

    public void setTotalOpens(Long totalOpens) {this.totalOpens = totalOpens;}

    public Long getTotalClicks() {return totalClicks;}

    public void setTotalClicks(Long totalClicks) {this.totalClicks = totalClicks;}
}
