package com.abdatytch.backend.dto.response;

/**
 * DTO pour les statistiques des utilisateurs.
 * Contient les chiffres sur les différents statuts d'utilisateurs.
 */
public class UserStatisticsDTO {

    /**
     * Total des utilisateurs.
     */
    private Long totalUsers;

    /**
     * Total des utilisateurs actifs.
     */
    private Long totalActiveUsers;

    /**
     * Total des utilisateurs inactifs.
     */
    private Long totalInactiveUsers;

    /**
     * Total des utilisateurs bannis.
     */
    private Long totalBannedUsers;

    /**
     * Total des utilisateurs bloqués.
     */
    private Long totalBlockedUsers;

    /**
     * Constructeur par défaut.
     */
    public UserStatisticsDTO() {}

    public Long getTotalUsers() {return totalUsers;}

    public void setTotalUsers(Long totalUsers) {this.totalUsers = totalUsers;}

    public Long getTotalActiveUsers() {return totalActiveUsers;}

    public void setTotalActiveUsers(Long totalActiveUsers) {this.totalActiveUsers = totalActiveUsers;}

    public Long getTotalInactiveUsers() {return totalInactiveUsers;}

    public void setTotalInactiveUsers(Long totalInactiveUsers) {this.totalInactiveUsers = totalInactiveUsers;}

    public Long getTotalBannedUsers() {return totalBannedUsers;}

    public void setTotalBannedUsers(Long totalBannedUsers) {this.totalBannedUsers = totalBannedUsers;}

    public Long getTotalBlockedUsers() {return totalBlockedUsers;}

    public void setTotalBlockedUsers(Long totalBlockedUsers) {this.totalBlockedUsers = totalBlockedUsers;}
}
