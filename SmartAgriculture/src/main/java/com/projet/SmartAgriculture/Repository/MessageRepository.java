package com.projet.SmartAgriculture.Repository;

import com.projet.SmartAgriculture.Entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Get full conversation between two parties (both directions)
    @Query("SELECT m FROM Message m WHERE " +
            "(m.expediteurType = :type1 AND m.expediteurId = :id1 AND m.destinataireType = :type2 AND m.destinataireId = :id2) OR " +
            "(m.expediteurType = :type2 AND m.expediteurId = :id2 AND m.destinataireType = :type1 AND m.destinataireId = :id1) " +
            "ORDER BY m.dateEnvoi ASC")
    List<Message> findConversation(@Param("type1") String type1, @Param("id1") Long id1,
                                   @Param("type2") String type2, @Param("id2") Long id2);

    // Unread messages for a given recipient
    @Query("SELECT m FROM Message m WHERE m.destinataireType = :type AND m.destinataireId = :id AND m.lu = false")
    List<Message> findUnreadFor(@Param("type") String type, @Param("id") Long id);

    // Mark messages as read in a conversation (messages sent TO the reader)
    @Query("SELECT m FROM Message m WHERE " +
            "m.destinataireType = :readerType AND m.destinataireId = :readerId AND " +
            "m.expediteurType = :otherType AND m.expediteurId = :otherId AND m.lu = false")
    List<Message> findUnreadInConversation(@Param("readerType") String readerType,
                                           @Param("readerId") Long readerId,
                                           @Param("otherType") String otherType,
                                           @Param("otherId") Long otherId);
}